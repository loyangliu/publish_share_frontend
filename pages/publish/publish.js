var auth = require('../../common/auth.js')
var api = require('../../common/api.js')

Page({
  data: {
    name: '',
    content: '',
    images: [],
    imageMaxNum: 9,
  },

  onShow: function () {
    auth.guard(); // 需要登录

    // 隐藏tabbar
    wx.hideTabBar();
  },

  // 返回按钮
  backTab: function () {
    wx.switchTab({
      url: getApp().lastTab,
      complete: function(){
        wx.showTabBar();
      }
    });
  },

  // 添加图片
  chooseImage: function(){
    // 关闭键盘
    wx.hideKeyboard();

    var count = this.data.imageMaxNum - this.data.images.length

    wx.chooseImage({
      count: count,
      success: (res) => {
        var tempFilePaths = res.tempFilePaths

        var data = [];

        for (let index in tempFilePaths) {
          let src = tempFilePaths[index];
          data.push({
            src: src
          });
        }

        this.data.images = this.data.images.concat(data);

        this.setData({
          'images': this.data.images
        });
      }
    });
  },

  // 删除图片
  deleteImage: function(e){
    let data = e.currentTarget.dataset;
    let index = data.index;
    this.data.images.splice(index, 1);
    this.setData({
      images: this.data.images
    });
  },

  // 发布
  publish: function (e) {
    var formData = e.detail.value;
    formData.name = formData.name.trim();
    formData.content = formData.content.trim();

    this.setData({
      name: formData.name,
      content: formData.content,
    });

    if (!formData.name) {
      wx.showToast({
        title: '请输入名称',
        icon: 'none',
      })
      return;
    }

    if (!formData.content) {
      wx.showToast({
        title: '请输入介绍内容',
        icon: 'none',
      })
      return;
    }

    wx.showLoading({
      mask: true,
    });

    // 图片上传结束后，提交
    this.uploadImages(() => {

      formData.images = JSON.stringify(this.getSuccessUploadImages());

      api.request({
        url: 'articles/publish',
        method: 'POST',
        data: formData,
        success: (res) => {
          wx.hideLoading();

          var data = res.data;

          // 发布失败
          if (data.code != 0) {
            wx.showToast({
              title: data.msg,
              mask: true,
              icon: 'none',
            });
            return;
          }

          // 发布成功
          wx.showToast({
            title: data.msg,
            mask: true,
            success: () => {

              // 重置表单
              this.setData({
                name: '',
                content: '',
                images: []
              });
            }
          });
        },

        fail: () => {
          wx.showToast({
            title: '发布失败！',
            icon: 'none',
            mask: true,
          });
        }
      });

    });
  },

  // 获取上传成功的图片列表
  getSuccessUploadImages: function () {
    var images = [];
    for (var index in this.data.images) {
      var image = this.data.images[index];
      if (image.serverFilePath) {
        images.push(image.serverFilePath);
      }
    }
    return images;
  },

  // 上传图片
  uploadImages: function(callback){

    // 无图片
    if (this.data.images.length == 0) {
      callback();
      return;
    }

    var count = 0;
    for (let index in this.data.images) {
      this.uploadImage(index, () => {
        count++;

        if (count == this.data.images.length){
          callback();
        }
      });
    }
  },

  // 上传图片
  uploadImage: function (index, callback){
    var image = this.data.images[index];

    // 图片已上传，则无需再上传
    if (image.serverFilePath) {
      callback();
      return;
    }

    wx.uploadFile({
      url: api.getUrl('articles/uploadImage'),
      filePath: image.src,
      formData: {
        api_token: auth.apiToken()
      },
      name: 'image',
      complete: (res) => {

        if (res.statusCode == 200) {

          var data = JSON.parse(res.data);

          if (data.code == 0) {
            image.serverFilePath = data.data.file;
          }
        }

        callback();
      }
    })
  }
});