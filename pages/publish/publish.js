// pages/publish/publish.js
Page({
  onLoad: function(){



    wx.login({
      success: function (res) {
        console.log(res);
        wx.getUserInfo({
          success: function(res){
            console.log(res);
          }
        })
      }
    });
  }
})