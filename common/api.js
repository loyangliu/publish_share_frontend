var config = require('./config.js');
var auth = require('./auth.js');

// 获取api url
function getUrl(uri){
  return config.service.apiUrl + '/' + uri;
}

// 发送api请求
function request(option){
  option.url = getUrl(option.url);
  option.data.api_token = auth.apiToken();
  if(!option.header){
    option.header = {};
  }
  option.header['content-type'] = 'application/x-www-form-urlencoded';
  return wx.request(option);
};

module.exports.getUrl = getUrl
exports.request = request