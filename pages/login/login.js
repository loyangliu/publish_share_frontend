var auth = require('../../common/auth.js')

Page({
  login: function(){
    auth.login();
  }
})