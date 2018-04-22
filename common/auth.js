var user;

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
  // todo
  return;
  if (!this.check()) {
    this.login();
  }
}

// 获取api token
function apiToken(){
  return this.user ? this.user.api_token : null;
};

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

          wx.request({
            method: 'POST',
            url: 'http://psw.test/api/auth/login',
            data: data,
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: (response) => {
              var data = response.data;

              // 登录失败
              if (data.code != 0){
                wx.switchTab({
                  url: '/pages/index/index',
                })
              }

              // 存储用户信息
              this.user = data.data.user;

              wx.hideLoading();

              wx.showToast({
                title: data.msg,
              })
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

// 跳转登录页
exports.redirectToLogin = redirectToLogin