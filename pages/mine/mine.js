// pages/mine/mine.js

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:null,
    current_tab: 0,
    
    // 统计信息
    basicInfo: {
      publis_num: 0,
      comment_num: 0,
      subscribe_num: 0
    },

    // 我的发布
    myPublish: {
      page:1,
      page_size:10,
      my_publish: null
    },

    // 我的关注
    mySubscribe: {
      my_subscribe: null
    },

    // 发送评论消息
    comments: {
      is_show: false,
      curr_articleid: 0,
      commitmsg: '',
      commitmsg_to: '0',
      commitmsg_touserid: 0,
      placeholder: ''
    }
  },

  switch_tap: function(event) {
    var current_tab = event.currentTarget.dataset.current
    this.setData({
      current_tab: current_tab
    })

    this.tap_event()
  },

  // 获取tab信息
  tap_event: function() {
    var api_token = wx.getStorageSync('api_token')

    if (this.data.current_tab == 0) { // 我的发布
      var page = this.data.myPublish.page
      var page_size = this.data.myPublish.page_size
      app.globalData.api.minePublish(api_token, page, page_size, cb_parms => {
        console.log(cb_parms)
        if (cb_parms.service_ok) {
          var res = cb_parms.data
          var code = res.code

          if (code == 0) {
            this.setData({
              'myPublish.page': parseInt(res.data.page),
              'myPublish.my_publish': res.data.my_publish
            })
          }
        }
      })
    } else if (this.data.current_tab == 1) { // 我的关注
      wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        success: res => {
          var latitude = res.latitude
          var longitude = res.longitude

          app.globalData.api.mineSubscribe(api_token, latitude, longitude, cb_parms => {
            console.log(cb_parms)
            if (cb_parms.service_ok) {
              var res = cb_parms.data
              var code = res.code

              if (code == 0) {
                this.setData({
                  'mySubscribe.my_subscribe': res.data.my_subscribe
                })
              }
            }
          })
        }
      }) 
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 获得 遮罩层 组件, selectComponent 从页面中<imodal> 里id=imodal的组件取出
    this.imodal = this.selectComponent("#imodal");

    // 将 imodal 设置为全局
    app.globalData.imodal = this.imodal

    // 获取 dialog
    this.dialog = this.selectComponent("#dialog");

    // 获取用户登录信息
    app.doLogin(()=>{
      // 装载用户信息
      this.setData({
        userInfo: app.globalData.userInfo
      })

      console.log("this.data.userInfo")
      console.log(app.globalData.userInfo)

      // 获取本地 token
      var api_token = wx.getStorageSync('api_token')

      // 获取页面基本信息
      app.globalData.api.mineBasicInfo(api_token, cb_parms => {
        console.log(cb_parms)
        if (cb_parms.service_ok) {
          var res = cb_parms.data
          var code = res.code

          if (code == 0) {
            this.setData({
              'basicInfo.publis_num': parseInt(res.data.my_num.publisNum),
              'basicInfo.comment_num': parseInt(res.data.my_num.commentNum),
              'basicInfo.subscribe_num': parseInt(res.data.my_num.subscribeNum)
            })
          }
        }
      })

      this.tap_event()
    })
  },

  /**
   * 唤起评论弹窗
   */
  showCommitWin: function (event) {
    console.log(event)

    var article_id = event.detail.articleid

    this.setData({
      'comments.is_show': !this.data.comments.is_show
    })

    if (this.data.comments.is_show) {
      if (event.detail.sendto) {
        this.setData({
          'comments.curr_articleid': event.detail.articleid,
          'comments.commitmsg_to': event.detail.sendto,
          'comments.commitmsg_touserid': parseInt(event.detail.sendtouserid),
          'comments.placeholder': '回复 ' + event.detail.sendto
        })
      } else {
        this.setData({
          'comments.curr_articleid': event.detail.articleid,
          'comments.commitmsg_to': '0',
          'comments.commitmsg_touserid': 0,
          'comments.placeholder': '我要评论'
        })
      }
    }
  },

  /**
     * 当场发送评论
     */
  _sendmsg: function (event) {
    if (this.data.comments.commitmsg == '') {
      return
    }

    var api_token = wx.getStorageSync('api_token')
    if (!api_token || app.globalData.userInfo == null) {
      app.doLogin()
    } else {
      var article_id = this.data.comments.curr_articleid
      var _from = app.globalData.userInfo.wx_nick_name
      var _fromuserid = app.globalData.userInfo.id
      var _to = this.data.comments.commitmsg_to
      var _touserid = this.data.comments.commitmsg_touserid
      var message = this.data.comments.commitmsg
      app.globalData.api.publishComments(api_token, article_id, _from, _fromuserid, _to, _touserid, message, cb_parms => {
        console.log(cb_parms)
        if (cb_parms.service_ok) {
          var res = cb_parms.data
          var code = res.code

          if (code == 0) {
            var comment = {
              article_id: article_id,
              from: _from,
              from_userid: _fromuserid,
              to: _to,
              to_userid: _touserid,
              message: message,
              commit_at: new Date()
            }

            var index = -1
            var articles = (this.data.current_tab == 0) ? this.data.myPublish.my_publish : this.data.mySubscribe.my_subscribe
            for (var i = 0; i < articles.length; i++) {
              if (articles[i].id == article_id) {
                index = i
                break
              }
            }

            if (index != -1) {
              // 修改本地数据
              if (this.data.current_tab == 0) {
                this.data.myPublish.my_publish[index].comments = this.data.myPublish.my_publish[index].comments.concat(comment)
                this.setData({
                  'myPublish.my_publish': this.data.myPublish.my_publish,
                  'comments.is_show': !this.data.comments.is_show,
                  'comments.commitmsg': ''
                })
              } else {
                this.data.mySubscribe.my_subscribe[index].comments = this.data.mySubscribe.my_subscribe[index].comments.concat(comment)
                this.setData({
                  'mySubscribe.my_subscribe': this.data.mySubscribe.my_subscribe,
                  'comments.is_show': !this.data.comments.is_show,
                  'comments.commitmsg': ''
                })
              }
            }
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
      'comments.commitmsg': event.detail.value
    })
  },

  /**
   * 关注帖子
   */
  subscribe: function (event) {
    this.dialog.showDialog(event.detail.article_id,
      event.detail.is_subscribe,
      event.detail.telphone,
      event.detail.message)
  },

  /**
   * 取消关注对话框
   */
  subscribe_cancel: function (event) {
    this.dialog.hideDialog()
  },

  /**
   * 确定关注
   */
  subscribe_confirm: function (event) {
    console.log(event)

    var telphone = event.detail.telphone
    var message = event.detail.message
    var article_id = event.detail.article_id
    var is_subscribe = event.detail.is_subscribe
    var api_token = wx.getStorageSync('api_token');

    if (telphone) {
      if (/^[1][3,4,5,7,8][0-9]{9}$/.test(telphone) == false &&
        /^(([0\+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/.test(telphone) == false) {
        wx.showToast({
          title: '请输入正确的手机或座机号码',
          icon: 'none'
        })
        return;
      }
    }

    app.globalData.api.toggleSubscribeArticle(api_token, article_id, telphone, message, 'subscribe', cb_parms => {
      console.log(cb_parms)

      if (cb_parms.service_ok) {
        var res = cb_parms.data
        var code = res.code

        if (code == 0) {
          this.dialog.hideDialog()

          var index = -1
          for (var i = 0; i < this.data.articles.contents.length; i++) {
            if (this.data.articles.contents[i].id == article_id) {
              index = i
              break
            }
          }

          if (index != -1) {
            // 修改本地数据
            this.data.articles.contents[index].isSubscribe = true

            this.setData({
              'articles.contents': this.data.articles.contents
            })
          }
        } else {
          wx.showToast({
            title: '关注失败！' + res
          })
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    app.globalData.lastTab = '/pages/mine/mine';
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})