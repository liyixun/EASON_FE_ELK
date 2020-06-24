const fs = require('fs');
const path = require('path');
const moment = require('moment');
const projectName = 'crm_node_server';
const logPath = path.resolve(__dirname, '../../company/CRM_NODE_SERVER/logs');
var {formatLogLine, getESClient} = require('./util.js');
var os = require('os');


const esClient = getESClient();

let date = moment().format('YYYY-MM-DD');
let logFileName = `${projectName}-node-log-${date}.log`;
let fullPath = logPath + '/' + logFileName;

fs.open(fullPath, 'a+', (err, fd) => {      // 判断文件是否存在
  if (err) {
    throw err;
  }
  let buffer;
  fs.watchFile(fullPath, {interval: 2000}, (curr, prev) => {
    if (curr.mtime > prev.mtime) {
      console.log('文件改变');
      buffer = Buffer.alloc(curr.size - prev.size);
      readFile(fd, buffer, (curr.size - prev.size), prev.size);
    } else {
      console.log('没有改变');
    }
  });
});


//https://juejin.im/post/5d4537a0e51d4561f40add03
function readFile(fd, buffer, length, position) {
  // read file
  fs.read(fd, buffer, 0, length, position, function (err, bytesRead, buffer) {
    if (err) {
      console.log(err);
    }
    let additionalContents = buffer.toString();
    let additionalContentList = additionalContents.split(os.EOL);     // 按换行符切割
    // console.log(additionalContentList);
    let bulkBody = [];
    additionalContentList.forEach(item => {
      if (item) {
        let fullObj = formatLogLine(item);
        if (fullObj) {
          bulkBody.push({
            index: {
              _type: 'logType',
              _index: 'crm_node_server',
              _id: fullObj.timeStamp
            }
          });
          bulkBody.push(JSON.stringify(fullObj));
        }
      }
    });
    if (bulkBody && bulkBody.length) {
      bulkToEs(bulkBody);
    }
  });
}


function bulkToEs(bulkBody) {
  esClient.bulk({body: bulkBody})
    .then(response => {
      console.log('返回');
    })
    .catch(e => {
      console.log(e);
    })
}
