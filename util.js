const reg = /\[(.+?)\]/g;
const logBaseFields = ['timestamp', 'logType', 'operatorEmail', 'operatorIP'];
const elasticsearch = require('elasticsearch');

exports.formatLogLine = function (line) {
  let str = ' - ';
  let logResult = line.split(str);
  if (logResult && logResult.length === 2) {
    let baseObj = {};
    let result = logResult[0].match(reg);
    if (result && result.length >= 2 && result.length <= 4) {
      let i;
      for (i = 0; i < 2; i++) {
        baseObj[logBaseFields[i]] = result[i].substring(1, result[i].length).substring(0, result[i].length - 2);
      }
      if (result.length === 4) {
        for (; i < 4; i++) {
          baseObj[logBaseFields[i]] = result[i].substring(1, result[i].length).substring(0, result[i].length - 2);
        }
      } else {
        for (; i < 4; i++) {
          baseObj[logBaseFields[i]] = "";
        }
      }
    }
    let logBody = {};
    try {
      logBody = JSON.parse(logResult[1]);
    } catch (e) {
      logBody = {};
    }
    let fullObj = Object.assign({}, baseObj, logBody);
    return fullObj;
  } else {
    return null;
  }
};

exports.getESClient = function () {
  return new elasticsearch.Client({
    host: '127.0.0.1:9200',
    log: 'trace'
  });
};
