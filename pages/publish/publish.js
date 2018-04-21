// pages/publish/publish.js
var auth = require('../../common/auth.js')

Page({
  onShow: function () {
    auth.guard();
  }
})