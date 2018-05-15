// components/article/article.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    article:{
      type: Object
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 组件绑定的关注事件处理函数
    _subscribe(event) {
      var userid = event.target.dataset.userid
      console.log(event)
      
      // 触发外层事件
      this.triggerEvent("subscribe")
    },

    /**
     * 点击显示消息框
     */
    _showdialog(event) {
      console.log(event)

      var articleid = event.currentTarget.dataset.articleid
      var sendto = event.currentTarget.dataset.to

      var eventDetail = {
        articleid: articleid,
        sendto: sendto
      }

      var eventOption = {

      }

      // triggerEvent函数接受三个值：事件名称、数据、选项值
      this.triggerEvent("sendmsg", eventDetail, eventOption)
    },
    
    // 点赞
    prise(e){
      var api_token = wx.getStorageSync('api_token')
      if (!api_token) {
        wx.showToast({
          title: '登录态缺失，正在为您重试！',
          icon: 'none',
          duration: 3000,
          success: function () {
            app.doLogin()
          }
        })
      } else {
        var article_id = this.data.article.id
        var _from = app.globalData.userInfo.wx_nick_name

        app.globalData.api.priseArticle(api_token, article_id, _from, cb_parms=>{
          if (cb_parms.service_ok) {
            var res = cb_parms.data
            var code = res.code
            console.log(cb_parms)

            if (code == 0) {
              var prises = {
                article_id: article_id,
                from: _from,
                commit_at: new Date()
              }
              this.setData({
                'article.prises': this.data.article.prises.concat(prises),
              })
            } else if (code == -1){
              wx.showToast({
                title: '亲，你已经点过赞啦！',
                icon: 'none'
              })
            } else {
              wx.showToast({
                title: '接口错误！'+code,
                icon: 'none'
              })
            }
          } else {
            wx.showToast({
              title: '网络失败！',
              icon: 'none'
            })
          }
        })
      }
    },

    /**
     * 放大浏览图片
     */
    travelimgs(e) {
      console.log(e)
      var imgs = e.currentTarget.dataset.imgs
      var curidx = e.currentTarget.dataset.curidx
      var current_url = imgs[curidx].path
      var urls = []

      for (var i = 0; i < imgs.length; i++) {
        urls.push(imgs[i].path)
      }

      wx.previewImage({
        current: current_url,
        urls: urls
      })
    }
  }
})
