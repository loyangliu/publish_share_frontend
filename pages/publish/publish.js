// pages/publish/publish.js
Page({
  onLoad: function(){

    wx.login({
      success: function (res) {
        
        var code = res.code;

        wx.getUserInfo({
          success: function(res){

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
              success: function(response){
                
              }
            })
          }
        })
      }
    });

  }
})