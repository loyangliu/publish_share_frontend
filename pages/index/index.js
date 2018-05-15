// pages/index/index.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 广告位：轮播
    boards: [
      { images: 'https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2519631933.jpg' },
      { images: 'https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2518856022.jpg' },
      { images: 'https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2515434674.jpg' }
    ],

    // 正文：帖子
    articles : {
      loading:false,
      currentpage:0,
      cursor:0,                // 数据库记录游标
      pagesize:5,
      contents:[]
    },

    // 发送评论消息
    comments: {
      is_show: false,
      curr_articleid:0,
      commitmsg: '',
      commitmsg_to: '0',
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

    this.setData({
      'articles.loading':true
    })

    app.globalData.api.fetchArticles(page, pagesize, cursor, cb_parms => {
      if (cb_parms.service_ok) {
        var res = cb_parms.data
        var code = res.code
        if (code == 0 && res.data.articles.data.length > 0) {
          this.setData({
            'articles.contents': this.data.articles.contents.concat(res.data.articles.data),
            'articles.currentpage': res.data.articles.page,
            'articles.cursor':res.data.articles.offsetId
          })
        }
      }

      this.setData({
        'articles.loading': false
      })
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

    app.globalData.api.fetchArticles(page, pagesize, cursor, cb_parms => {

      wx.stopPullDownRefresh();
      console.log(cb_parms)

      if (cb_parms.service_ok) {
        var res = cb_parms.data
        var code = res.code

        if (code == 0 && res.data.articles.data.length > 0) {
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
  },

  /**
     * 当场发送评论
     */
  _sendmsg(event) {
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
              'isShow': !this.data.isShow,
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

  /**
   * 关注帖子
   */
  subscribe:function(event) {
    console.log(event)
  },

  subscribee: function (event) {
    console.log(event)
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
          'comments.placeholder': '回复 ' + event.detail.sendto
        })
      } else {
        this.setData({
          'comments.curr_articleid': event.detail.articleid,
          'comments.commitmsg_to': '0',
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
      var article_id = this.data.comments.curr_articleid
      var _from = app.globalData.userInfo.wx_nick_name
      var _to = this.data.comments.commitmsg_to
      var message = this.data.comments.commitmsg
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

            var index = -1
            for (var i = 0; i < this.data.articles.contents.length; i++) {
              if (this.data.articles.contents[i].id == article_id) {
                index = i
                break
              }
            }
            
            if(index != -1) {
              // 修改本地数据
              this.data.articles.contents[index].comments = this.data.articles.contents[index].comments.concat(comment)

              this.setData({
                'articles.contents': this.data.articles.contents,
                'comments.is_show': !this.data.comments.is_show,
                'comments.commitmsg': ''
              })
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