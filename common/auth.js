var api = require('./api.js');

var user = null;

// 跳转到登录页
function redirectToLogin(){
  wx.navigateTo({
    url: '/pages/login/login',
  });
}

// 认证状态
function check(){
  return !!this.user;
};

// 未登录，则跳转登录页
function guard(){
  if (!this.check()) {
    this.navigateToLogin();
  }
}

// 获取api token
function apiToken(){
  return this.user ? this.user.api_token : null;
};

function navigateToLogin(){
  wx.navigateTo({
    url: '/pages/login/login',
  });
}

// 登录
function login(){

  wx.showLoading({
    title: '登录中',
    mask: true,
  });

  // 微信登录
  wx.login({
    success: (res) => {

      var code = res.code;

      // 获取用户微信信息
      wx.getUserInfo({
        success: (res) => {

          // 小程序登录
          var data = {
            code: code,
            encryptedData: res.encryptedData,
            iv: res.iv
          };

          api.request({
            method: 'POST',
            url: 'auth/login',
            data: data,
            success: (response) => {
              var data = response.data;

              wx.hideLoading();

              // 登录失败
              if (data.code != 0){
                wx.showModal({
                  title: data.msg ? data.msg : '登录失败！',
                  cancelText: '返回首页',
                  success: function(res){
                    if (res.cancel){
                      wx.switchTab({
                        url: '/pages/index/index',
                      })
                    }
                  }
                });
                return;
              }

              // 存储用户信息
              this.user = data.data.user;

              wx.navigateBack();
            },
            fail: function(){
              wx.showModal({
                title: '登录失败！',
                cancelText: '返回首页',
                success: function (res) {
                  if (res.cancel) {
                    wx.switchTab({
                      url: '/pages/index/index',
                    })
                  }
                }
              });
            }
          })
        }
      })
    }

  });
}

// 获取认证用户信息
module.exports.user = user

// 检查登录
exports.check = check

// 登录
exports.login = login

// 拦截未登录请求
exports.guard = guard

exports.apiToken = apiToken

exports.navigateToLogin = navigateToLogin;

// 跳转登录页
exports.redirectToLogin = redirectToLogin