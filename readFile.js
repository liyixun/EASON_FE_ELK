const fs = require('fs');
const join = require('path').join;
const path = require('path');

function getJsonFiles(jsonPath){
  let jsonFiles = [];
  function findJsonFile(path){
    let files = fs.readdirSync(path);
    files.forEach(function (item, index) {
      let fPath = join(path,item);
      let stat = fs.statSync(fPath);
      if(stat.isDirectory() === true) {
        findJsonFile(fPath);
      }
      if (stat.isFile() === true) {
        jsonFiles.push(fPath);
      }
    });
  }
  findJsonFile(jsonPath);
  console.log(jsonFiles);
}

let logPath = path.resolve(__dirname, '../../company/CRM_NODE_SERVER/logs');
let files = fs.readdirSync(logPath);
let pattern = /\w-log-2020-04-*/;
files.forEach(item => {
  if (pattern.test(item)) {
    console.log(item);
  }
});
// console.log(files);
