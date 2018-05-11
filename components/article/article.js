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
    isShow: false,
    commitmsg:'',
    commitmsg_to:'0',
    placeholder:''
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
    showdialog(event) {
      console.log(event)
      this.setData({
        isShow: !this.data.isShow,
      })

      if(this.data.isShow) {
        if(event.currentTarget.dataset.to) {
          this.setData({
            commitmsg_to: event.currentTarget.dataset.to,
            placeholder: '回复 ' + event.currentTarget.dataset.to
          })
        } else {
          this.setData({
            commitmsg_to: '0',
            placeholder: '我要评论'
          })
        }
      }

    },

    /**
     * 当场发送评论
     */
    _sendmsg(event) {
      console.log(this.data.article)
      console.log(app.globalData.userInfo)
      if (this.data.commitmsg == '') {
        return
      }

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
        var _to = this.data.commitmsg_to
        var message = this.data.commitmsg
        app.globalData.api.publishComments(api_token, article_id, _from, _to, message, cb_parms => {
          console.log(cb_parms)
          if (cb_parms.service_ok) {
            var res = cb_parms.data
            var code = res.code

            if (code == 0) {
              var comment = {
                article_id: article_id,
                from: _from,
                to: _to,
                message: message,
                commit_at: new Date()
              }
              this.setData({
                isShow: !this.data.isShow,
                'article.comments': this.data.article.comments.concat(comment),
                commitmsg: ''
              })
            } else {
              wx.showToast({
                title: '接口错误！',
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
     * 实时将input数据写入controller
     */
    inputmsg(event) {
      this.setData({
        commitmsg: event.detail.value
      })
    },
    
    // 点赞
    support(e){
      console.log(this.data);
    }
  }
})
