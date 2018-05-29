//app.js

App({
  globalData: {
    api: null,
    userInfo: null,
    imodal:null
  },



  /**
   * 发起登录
   * wx.login 获取 code -> wx.getSetting 获取当前用户授权设置 -> wx.getUserInfo 获取解密code的相关数据，得到    * 用户基本信息（包括敏感数据openid）
   */
  doLogin(callback) {
    wx.login({
      success: res=>{
        var code = res.code

        // 获取当前用户授权设置情况
        wx.getSetting({
          success: res => {
            // 已授权获取用户基本信息
            if (res.authSetting['scope.userInfo']) {
              // 后台根据code获取用户信息，前提是用户已经授权
              wx.getUserInfo({
                success: res => {
                  this.globalData.api.doLogin(code, res.encryptedData, res.iv, cb_parms => {
                    if (cb_parms.service_ok) {
                      if (cb_parms.data.code == 0) {
                        wx.setStorageSync('api_token', cb_parms.data.data.user.api_token)
                        this.globalData.userInfo = cb_parms.data.data.user

                        if (callback != null) {
                          callback()
                        }
                      }
                    }
                  })
                },
                fail: res => {
                  console.log("fail----"+res)
                }
              })
            } else {
              // 没有授权，则主动申请授权。
              // 注意: 1, 当 scope 为 "scope.userInfo" 时，无法通过 wx.authorize弹出授权窗口。需要外部通过button触发授权弹窗的弹出。
              //       2, 用户首次拒绝权限后，无法再次通过 wx.authorize 弹出授权窗口，需要通过wx.openSetting来解决

              // 这里采用弹出 遮罩层 ，提示用户点击授权按钮，进而弹出授权用户基本信息
              if(this.globalData.imodal != null) {
                this.globalData.imodal.showModal(callback)
              }
            }
          }
        })
      }
    })
  },

  /**
   * 用户登录
   */
  userLogin() {
    var api_token = wx.getStorageSync('api_token')

    if (api_token) {
      this.globalData.api.authCheck(api_token, cb_parms=>{
        if (cb_parms.service_ok) {
          if (cb_parms.data.code != 0) {  // 认证失败
            this.doLogin()
          } else {
            this.globalData.userInfo = cb_parms.data.data.user
          }
        }
      })
    } else {
      this.doLogin()
    }
  },

    /**
   * 生命周期函数--监听小程序初始化
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch() {
    this.globalData.api = require('utils/api.js')

    this.userLogin()
  }
})