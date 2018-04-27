//index.js
var auth = require('../../common/auth.js')
var config = require('../../common/config.js');
var api = require('../../common/api.js');

Page({
  data: {
    articles:[],
    page:1,
    offsetId:0,
  },
  onLoad: function () {
    this.loadArticles();
  },

  // 刷新
  onPullDownRefresh: function(){
    this.loadArticles(true);
  },

  onReachBottom: function(){
    this.loadArticles();
  },

  // 加载帖子
  loadArticles: function(refresh = false){

    if(refresh){
      wx.showNavigationBarLoading();
    }else{
      wx.showLoading({
        title: '加载中'
      });
    }

    api.request({
      url: 'articles/home',
      data: {
        page: this.getArticleNextPage(),
        offsetId: this.getArticleoffsetId()
      },
      success: (res) => {

        if(refresh){
          wx.hideNavigationBarLoading();
          this.setData({
            articles: [],
            page: 1,
            offsetId: 0,
          });
        }else{
          wx.hideLoading();
        }

        var data = res.data;

        if (data.code == 0){

          if (!data.data.articles.data.length){
            wx.showToast({
              title: '没有了！',
              icon:'none'
            })
          }

          this.setData({
            articles: this.data.articles.concat(data.data.articles.data)
          });
        }
      }
    })
  },

  // 获取下一页页面
  getArticleNextPage: function(){
    return this.data.page++;
  },

  // 开始的文章
  getArticleoffsetId: function(){
    return this.data.offsetId;
  }
})
