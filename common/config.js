var host = wx.getSystemInfoSync().brand == 'devtools' ? "http://psw.test" : 'https://www.loyangliu.com';
//host = 'https://www.loyangliu.com';
var apiPrefix = 'api';
var apiUrl = host + '/' + apiPrefix;

var config = {
  service: {
    host,
    apiUrl: apiUrl,
    urls: {

      // 登录
      login: `${apiUrl}/auth/login`,

      // 获取文章列表
      articles: `${apiUrl}/articles/get`,
      
    }
  }
};

module.exports = config;