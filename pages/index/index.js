//index.js
var auth = require('../../common/auth.js')
var app = getApp();

Page({
  data: {
    articles:[],
    page:1,
    offsetId:0,
  },
  onLoad: function () {
    this.loadArticles();
  },

  // 加载帖子
  loadArticles: function(){
    wx.request({
      url: app.API_URL + '/article/home',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        page: this.getArticleNextPage(),
        offsetId: this.getArticleoffsetId()
      },
      success: (res) => {
        var data = res.data;

        if (data.code == 0){
          this.setData({
            articles: this.data.articles.concat(data.data.articles.data)
          });

          console.log(this.data.articles);
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
