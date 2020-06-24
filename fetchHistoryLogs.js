const fs = require('fs');
const readline = require('readline');
const path = require('path');
const mapping = require(path.resolve('./mapping.json'));
const logPath = path.resolve(__dirname, '../../company/CRM_NODE_SERVER/logs');
var {formatLogLine, getESClient} = require('./util.js');


const esClient = getESClient();

function main() {
  console.log(mapping);
  esClient.indices.exists({index: "crm_node_server"}).then(exists => {
    console.log('exists的结果');
    console.log(exists);
    if (exists) {
      // fetchHistoryLogs('./logs/crm_node_server-node-log-2020-04-03.log');
      batchFetchHistoryLogs();
    } else {
      esClient.indices.create({index: "crm_node_server", body: mapping, ignore: [400, 404]}).then(result => {
        console.log('create的结果');
        console.log(result);
        batchFetchHistoryLogs();
        // fetchHistoryLogs('./logs/crm_node_server-node-log-2020-04-03.log');
      });
    }

  }).catch(error => {
    console.log(error);
  });
}

function batchFetchHistoryLogs() {
  let fileList = getFileNameList();
  fileList.forEach(async item => {
    await fetchHistoryLogs(logPath + '/' + item);
  });
}


function getFileNameList() {
  let files = fs.readdirSync(logPath);
  let pattern = /\w-log-2020-04-*/;
  let fileList = [];
  files.forEach(item => {
    if (pattern.test(item)) {
      fileList.push(item);
    }
  });
  return fileList;
}


function fetchHistoryLogs(filename) {
  return new Promise(resolve => {
      const rl = readline.createInterface({
        input: fs.createReadStream(filename, {encoding: 'utf8'}),
        output: null,
        terminal: false
      });
      let bulkBody = [];

      rl.on('line', (line) => {
        if (line) {
          let fullObj = formatLogLine(line);
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
      }).on('close', () => {
        bulkToEs(bulkBody);
        resolve(true);
        console.log('关闭');
      });
    }
  )
    ;
}

function bulkToEs(bulkBody) {
  esClient.bulk({body: bulkBody})
    .then(response => {
      console.log('返回');
      // let errorCount = 0;
      // response.items.forEach(item => {
      //   if (item.index && item.index.error) {
      //     console.log(++errorCount, item.index.error);
      //   }
      // });
      // console.log(
      //   `Successfully indexed ${data.length - errorCount} out of ${data.length} items`
      // );
    })
    .catch(e => {
      console.log(e);
    })
}

main();
