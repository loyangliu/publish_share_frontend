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
      if (cb_parms.service_ok) {
        var res = cb_parms.data
        var code = res.code

        if (code == 0 && res.data.articles.data.length > 0) {
          this.setData({
            'articles.contents': res.data.articles.data,
            'articles.currentpage': res.data.articles.page,
            'articles.cursor': res.data.articles.offsetId
          })

          console.log(this.data.articles.contents)
        }
      }

      this.setData({
        'articles.loading': false
      })
    })
  },

  /**
   * 发送评论
   */
  sendmsg:function(event) {
    console.log(event)
  },

  /**
   * 关注帖子
   */
  subscribe:function(event) {
    console.log(event)
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
    console.log('index page onHide()...')
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