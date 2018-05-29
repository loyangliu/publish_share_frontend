// pages/index/index.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 广告位：轮播
    boards: [
      { images: 'https://www.loyangliu.com/storage/index/1.jpg' },
      { images: 'https://www.loyangliu.com/storage/index/2.jpg' },
      { images: 'https://www.loyangliu.com/storage/index/3.jpg' }
    ],

    current_tab: 0,

    // 正文：帖子
    articles : {
      loading:false,
      currentpage:0,
      cursor:0,                // 数据库记录游标
      pagesize:5,
      contents:[]
    },

    // 附件的事
    nearby:{
      contents: []
    },

    // 发送评论消息
    comments: {
      is_show: false,
      curr_articleid:0,
      commitmsg: '',
      commitmsg_to: '0',
      commitmsg_touserid: 0,
      placeholder: ''
    }
    
  },

  /**
   * 装载帖子(场景：初始化时，页面上拉)
   */
  loadMoreArticles: function(){
    if (this.data.articles.loading) {
      return; 
    }

    var page = this.data.articles.currentpage + 1
    var cursor = this.data.articles.cursor
    var pagesize = this.data.articles.pagesize
    var userid = app.globalData.userInfo ? app.globalData.userInfo.id : 0

    this.setData({
      'articles.loading':true
    })

    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: res => {
        var latitude = res.latitude
        var longitude = res.longitude

        app.globalData.api.fetchArticles(userid, latitude, longitude, page, pagesize, cursor, cb_parms => {
          if (cb_parms.service_ok) {
            var res = cb_parms.data
            var code = res.code
            if (code == 0 && res.data.articles.data.length > 0) {

              for (var i = 0; i < res.data.articles.data.length; i++) {
                var sublen = 20
                var description = res.data.articles.data[i].description

                if (description.length > sublen) {
                  while (description[sublen - 1] == '\n' || description[sublen - 1] == '\r') {
                    sublen++
                  }

                  res.data.articles.data[i].desc_short = description.substr(0, sublen).concat(' . . . ')
                }
              }

              this.setData({
                'articles.contents': this.data.articles.contents.concat(res.data.articles.data),
                'articles.currentpage': res.data.articles.page,
                'articles.cursor': res.data.articles.offsetId
              })
            }
          }

          this.setData({
            'articles.loading': false
          })
        })
      }
    })
  },

  /**
   * 刷新帖子（场景：页面下拉），会重置数据
   */
  refreshArticles:function(){
    if (this.data.articles.loading) {
      return;
    }

    this.setData({
      'articles.loading': true
    })

    var page = 1
    var pagesize = this.data.articles.pagesize
    var cursor = 0
    var userid = app.globalData.userInfo ? app.globalData.userInfo.id : 0
    console.log("------>"+userid)

    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: res => {
        var latitude = res.latitude
        var longitude = res.longitude

        app.globalData.api.fetchArticles(userid, latitude, longitude, page, pagesize, cursor, cb_parms => {

          wx.stopPullDownRefresh();
          console.log(cb_parms)

          if (cb_parms.service_ok) {
            var res = cb_parms.data
            var code = res.code

            if (code == 0 && res.data.articles.data.length > 0) {

              for (var i = 0; i < res.data.articles.data.length; i++) {
                var sublen = 20
                var description = res.data.articles.data[i].description

                if (description.length > sublen) {
                  while (description[sublen - 1] == '\n' || description[sublen - 1] == '\r') {
                    sublen++
                  }
                  res.data.articles.data[i].desc_short = description.substr(0, sublen).concat(' . . . ')
                }
              }

              this.setData({
                'articles.contents': res.data.articles.data,
                'articles.currentpage': res.data.articles.page,
                'articles.cursor': res.data.articles.offsetId
              })
            }
          }

          this.setData({
            'articles.loading': false
          })
        })
      }
    })
  },

  

  /**
   * 实时将input数据写入controller
   */
  inputmsg(event) {
    this.setData({
      commitmsg: event.detail.value
    })
  },

  /**
   * 关注帖子
   */
  subscribe:function(event) {
    this.dialog.showDialog(event.detail.article_id, 
                          event.detail.is_subscribe,
                          event.detail.telphone,
                          event.detail.message)
  },

  /**
   * 取消关注对话框
   */
  subscribe_cancel: function(event) {
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

          // 分tab刷新本地数据
          var tab_articles = null
          if(this.data.current_tab == 0) {
            tab_articles = this.data.articles.contents
          } else if (this.data.current_tab == 1) {
            tab_articles = this.data.nearby.contents
          }

          var index = -1
          for (var i = 0; i < tab_articles.length; i++) {
            if (tab_articles[i].id == article_id) {
              index = i
              break
            }
          }

          if (index != -1) {
            // 修改本地数据
            tab_articles[index].isSubscribe = true
            
            var my_userid = app.globalData.userInfo.id
            for (var i = 0; i < tab_articles[index].subscribe.length; i++) {
              if (tab_articles[index].subscribe[i].user_id == my_userid) {
                tab_articles[index].subscribe[i].telphone = telphone
                tab_articles[index].subscribe[i].message = message
                break
              }
            }

            if(this.data.current_tab == 0) {
              this.setData({
                'articles.contents': tab_articles
              })
            } else if (this.data.current_tab == 1) {
              this.setData({
                'nearby.contents': tab_articles
              })
            }
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
   * 唤起评论弹窗
   */
  showCommitWin:function(event) {
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
  _sendmsg: function(event) {
    if (this.data.comments.commitmsg == '') {
      return
    }

    var api_token = wx.getStorageSync('api_token')
    if (!api_token || app.globalData.userInfo==null) {
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

            // 分tab刷新本地数据
            var tab_articles = null
            if (this.data.current_tab == 0) {
              tab_articles = this.data.articles.contents
            } else if (this.data.current_tab == 1) {
              tab_articles = this.data.nearby.contents
            }

            var index = -1
            for (var i = 0; i < tab_articles.length; i++) {
              if (tab_articles[i].id == article_id) {
                index = i
                break
              }
            }
            
            if(index != -1) {
              // 修改本地数据
              tab_articles[index].comments = tab_articles[index].comments.concat(comment)

              if (this.data.current_tab == 0) {
                this.setData({
                  'articles.contents': tab_articles,
                  'comments.is_show': !this.data.comments.is_show,
                  'comments.commitmsg': ''
                })
              } else if (this.data.current_tab == 1) {
                this.setData({
                  'nearby.contents': tab_articles,
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

  switch_tap: function (event) {
    var current_tab = event.currentTarget.dataset.current
    this.setData({
      current_tab: current_tab
    })

    if(current_tab == 1) {
      wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        success: res => {
          var latitude = res.latitude
          var longitude = res.longitude
          var userid = app.globalData.userInfo ? app.globalData.userInfo.id : 0

          app.globalData.api.nearbyArticles(userid, latitude, longitude, cb_parms => {
            if (cb_parms.service_ok) {
              var res = cb_parms.data
              var code = res.code
              if (code == 0) {
                this.setData({
                  'nearby.contents': res.data.articles.data,
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
    console.log('index page onLoad()...')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('index page onReady()...')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('index page onShow()...')
    this.refreshArticles()

    // 获得 遮罩层 组件, selectComponent 从页面中<imodal> 里id=imodal的组件取出
    this.imodal = this.selectComponent("#imodal");

    // 将 imodal 设置为全局
    app.globalData.imodal = this.imodal

    // 获取 dialog
    this.dialog = this.selectComponent("#dialog");
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    app.globalData.lastTab = '/pages/index/index';
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('index page onUnload()...')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.refreshArticles()

    // 当文章列表刷新后，需要对article的读取更多（more）的可显示状态做初始化更新
    for (var i = 0; i < this.data.articles.contents.length; i++) {
      var article_component = this.selectComponent("#article" + this.data.articles.contents[i].id); 
      if (article_component != null) {
        article_component.reset_more()  // 重置 article more 的状态
      }
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadMoreArticles()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})