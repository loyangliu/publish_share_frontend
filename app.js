//app.js

App({
  globalData: {
    api: null,
    userInfo: null,
    lastTab: '/pages/index/index'
  },

  /**
   * 发起登录
   */
  doLogin() {
    wx.login({
      success: res=>{
        var code = res.code

        // 后台根据code获取用户微信信息，前台保存登录态
        wx.getUserInfo({
          success: res=>{
            this.globalData.api.doLogin(code, res.encryptedData, res.iv, cb_parms=>{
              if (cb_parms.service_ok) {
                if (cb_parms.data.code == 0) {
                  wx.setStorageSync('api_token', cb_parms.data.data.user.api_token)
                  this.globalData.userInfo = cb_parms.data.data.user
                }
              }
            })
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