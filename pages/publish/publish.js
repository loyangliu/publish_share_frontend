// pages/publish/publish.js
var auth = require('../../common/auth.js')
var api = require('../../common/api.js');
var config = require('../../common/config.js');

Page({
  data:{
    name:'',
    description:'',
    images:[],
    imageMaxNumber:9,
    isCanChooseImage: true, // 是否可以继续选择图片
  },

  onShow: function(){
    // 此页需要登录才能访问
    auth.guard();
  },

  // 选择图片
  chooseImage: function(){
    
    // 关闭键盘
    wx.hideKeyboard();

    // 最多可选9张图，获取剩余可选的数量
    var leng = this.data.images.length;
    var count = this.data.imageMaxNumber - leng;

    // 选择图片
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

        // 满9张图后隐藏添加图片按钮
        if (this.data.images.length == this.data.imageMaxNumber) {
          this.closeImageChoose();
        }

        this.setData({
          'images': this.data.images
        });
      }
    });
  },

  // 关闭图片选择
  closeImageChoose: function(){
    this.setData({
      isCanChooseImage:false
    });
  },

  // 开启图片选择
  openImageChoose: function () {
    this.setData({
      isCanChooseImage: true
    });
  },

  // 删除图片
  deleteImage: function(e){
    let data = e.currentTarget.dataset;
    let index = data.index;
    this.data.images.splice(index, 1);

    // 图片数量未超过限制，则允许继续选择
    if (this.data.images.length < this.data.imageMaxNumber) {
      this.openImageChoose();
    }

    this.setData({
      images: this.data.images
    });
  },

  // 上传图片后提交发布
  uploadImageSubmitPublish:function(e){

    var formData = e.detail.value;
    formData.name = formData.name.trim();
    formData.description = formData.description.trim();

    this.setData({
      name: formData.name,
      description: formData.description,
    });

    if(!formData.name){
      wx.showToast({
        title: '请输入名称',
        icon:'none',
      })
      return;
    }

    if (!formData.description){
      wx.showToast({
        title: '请输入描述',
        icon: 'none',
      })
      return;
    }

    wx.showLoading({
      title: '正在发布',
      mask:true,
    });

    // 无图片则直接提交
    if (this.data.images.length == 0) {
      this.submitPublish();
      return;
    }

    var completeNum = 0;

    // 上传图片
    for(let index in this.data.images){
      this.uploadImage(index, (bool) => {
        completeNum++;

        // 全部上传完成，提交发布
        if (completeNum == this.data.images.length){
          this.submitPublish();
        }
      });
    }
  },

  // 提交发布
  submitPublish: function(){
    var formData = {
      name: this.data.name,
      description: this.data.description,
      images: JSON.stringify(this.getSuccessUploadImages()),
      api_token: auth.apiToken()
    };

    // 提交发布
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
          title:data.msg,
          mask:true,
          success:() => {
            // 发布成功跳转我的帖子页
            this.resetPublish(false);
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
  },

  // 获取上传成功的图片列表
  getSuccessUploadImages: function(){
    var images = [];
    for(var index in this.data.images){
      var image = this.data.images[index];
      if (image.serverFilePath){
        images.push(image.serverFilePath);
      }
    }
    return images;
  },

  // 上传图片
  uploadImage: function (index, complete) {
    var image = this.data.images[index];
    
    // 图片已上传，则无需再上传
    if (image.serverFilePath){
      complete(true);
      return;
    }

    wx.uploadFile({
      url: api.getUrl('articles/uploadImage'),
      filePath: image.src,
      formData:{
        api_token:auth.apiToken()
      },
      name: 'image',
      complete: (res) => {

        var bool = false;

        if (res.statusCode == 200) {

          var data = JSON.parse(res.data);

          if (data.code == 0) {
            image.serverFilePath = data.data.file;
            bool = true;
          }
        }

        if (complete){
          complete(bool);
        }
      }
    })
  },

  // 重置表单
  resetPublish: function (showConfirm = true){

    if (!showConfirm){
      this.setData({
        name: '',
        description: '',
        images: []
      });

      this.openImageChoose();
      return;
    }

    wx.showModal({
      title:'重置表单',
      content: '确定要清空输入的内容吗？',
      success: (res) => {

        if (res.confirm){
          this.setData({
            name: '',
            description: '',
            images: []
          });

          this.openImageChoose();
        }

      }
    });
  }
})