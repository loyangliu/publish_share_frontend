// pages/login/login.js
var auth = require('../../common/auth.js')

Page({
  onShow: function () {

    // 登录，成功后返回要访问页面
    auth.login(function(){
      wx.navigateBack();
    });

  },
})