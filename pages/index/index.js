var api = require('../../common/api.js');
var auth = require('../../common/auth.js')

Page({
  data: {

    // 当前tab页
    active: 0,

    // 数据
    data: [
      {
        label: '首页',
        name:'home',
        page: 0,
        offset: 0,
        scrollTop:0,
        articles: [],
        moreLoading: false,
        loading: false,
        moreLoadRequest:false,
      },
      {
        label: '关注',
        name: 'follow',
        page: 0,
        offset: 0,
        scrollTop: 0,
        articles: [],
        moreLoading: false,
        loading: false,
        moreLoadRequest: false,
      },
    ]

  },

  onLoad: function(){
    
    // 加载文章
    this.loadMoreArticles();

  },

  //  加载更多
  onReachBottom: function () {
    this.loadMoreArticles();
  },

  // 刷新文章
  onPullDownRefresh: function () {
    this.refreshArticles();
  },

  // 获取当前是否已经在加载请求中
  isLoading: function(){
    return this.data.data[this.data.active].moreLoading || this.data.data[this.data.active].loading;
  },

  // 加载更多文章
  loadMoreArticles: function(){

    // 加载中，则不允许重复发送请求
    if (this.isLoading()) {
      return;
    }

    var index = this.data.active;
    var key = 'data[' + index + ']';

    // 设置加载中的状态
    this.setData({
      [key + '.moreLoading']: true
    }, () => {

      var item = this.data.data[index];

      // 发起请求
      var request = api.request({
        url: 'articles/' + item.name,
        data: {
          page: item.page + 1,
          offsetId: item.offset
        },
        success: (res) => {

          var articles = res.data.data.articles;

          this.setData({
            [key + '.moreLoading']: false
          });

          if (articles.data.length > 0){
            this.setData({
              [key + '.articles']: item.articles.concat(articles.data),
              [key + '.page']: articles.page,
              [key + '.offset']: articles.offsetId,
            });
          }else{
            wx.showToast({
              title: '没有了~',
              icon: 'none',
            });
          }
        },
        fail: () => {
          this.setData({
            [key + '.moreLoading']: false
          });

          wx.showToast({
            title: '请求失败！',
            icon: 'none',
          });
        }
      });

      this.setData({
        [key + '.moreLoadRequest']: request
      });

    });
  },

  // 刷新帖子
  refreshArticles: function(){
    
    wx.stopPullDownRefresh();
    var index = this.data.active;
    var item = this.data.data[index];

    // 正在刷新
    if (item.loading) {
      return;
    }

    // 终止加载更多请求
    if(item.moreLoading){
      item.moreLoadRequest.abort();
    }

    var key = 'data[' + index + ']';

    this.setData({
      [key + '.loading']: true
    }, () => {
      api.request({
        url: 'articles/' + item.name,
        data: {
          page: 1,
          offsetId: 0
        },
        complete: (res) => {

          this.setData({
            [key + '.loading']: false
          });

          if(res.data && res.data.code == 0){
            
            var articles = res.data.data.articles;

            if (articles.data.length < 0){
              articles.page = 1;
              articles.offset = 0;
            }

            this.setData({
              [key + '.articles']: articles.data,
              [key + '.page']: articles.page,
              [key + '.offset']: articles.offsetId
            });

          }else{
            wx.showToast({
              title: '请求失败！',
              icon: 'none',
            });
          }
        }
      });
    });
  },

  tapSwitchTab: function(e){
    this.switchTab(e.target.dataset.index);
  },

  // 切换tab
  switchTab: function(index){

    if(this.data.data[index].name == 'follow'){

      // 关注页需要登录
      if(!auth.check()){
        auth.navigateToLogin();
        return;
      }

    }

    // 记录滚条位置
    wx.createSelectorQuery().selectViewport().scrollOffset((res) => {

      this.setData({
        active: index,
        ['data[' + this.data.active + '].scrollTop']: Math.max(res.scrollTop, 0)
      }, () => {

        // 恢复滚动条位置
        wx.pageScrollTo({
          scrollTop: this.data.data[index].scrollTop,
          duration: 0
        });

        // 无数据，则需重新初始化数据
        if (this.data.data[index].articles.length < 1){
          this.refreshArticles();
        }
      });

    }).exec();
  },

  onHide: function(){
    getApp().lastTab = '/pages/index/index';
  }
});