// pages/publish/publish.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    description: '',
    telphone: '',
    location: '',
    images: [],
    imageMaxNumber: 9,
    isCanChooseImage: true, // 是否可以继续选择图片
  },

  // 返回按钮
  backTab: function () {
    wx.switchTab({
      url: app.globalData.lastTab,
      complete: function () {
        wx.showTabBar();
      }
    });
  },

  /**
   * 选择图片
   */
  chooseImage: function () {
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

  /**
   * 关闭（隐藏）图片选择
   */
  closeImageChoose: function () {
    this.setData({
      isCanChooseImage: false
    });
  },

  /**
   * 删除图片
   */
  deleteImage:function(event) {
    var index = event.currentTarget.dataset.index
    this.data.images.splice(index, 1)

    if (this.data.images.length < this.data.imageMaxNumber) {
      this.openImageChoose()
    }

    this.setData({
      images: this.data.images
    })
  },

  /**
   * 打开（显示）图片选择
   */
  openImageChoose: function() {
    this.setData({
      isCanChooseImage: true
    })
  },

  /**
   * 发布帖子
   */
  uploadImageSubmitPublish: function(event) {
    var description = event.detail.value.description.trim()
    if (!description) {
      wx.showToast({
        title: '请输入描述',
        icon: 'none'
      })
      return;
    }
    this.data.description = description

    var telphone = event.detail.value.telphone.trim()
    if (telphone) {
      if (/^[1][3,4,5,7,8][0-9]{9}$/.test(telphone) ||
        /^(([0\+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/.test(telphone)) {
        this.data.telphone = telphone
      } else {
        wx.showToast({
          title: '请输入正确的手机或座机号码',
          icon: 'none'
        })
        return;
      }
    }

    var location = event.detail.value.location.trim()
    if (location) {
      this.data.location = location
    }
    
    var api_token = wx.getStorageSync('api_token')
    if (!api_token || app.globalData.userInfo == null) {
      app.doLogin()
    } else {
      wx.showLoading({
        title: '正在发布',
        mask: true
      })

      // 上传图片
      var completeNum = 0;
      for (var index = 0; index < this.data.images.length; index++) {
        this.uploadImage(index, res => {
          completeNum++

          // 提交发布
          if (completeNum == this.data.images.length) {
            this.submitPublish()
          }
        })
      }

      if (this.data.images.length == 0) {
        this.submitPublish()
      }
    }
  },

  /**
   * 上传图片
   */
  uploadImage:function(index, callback) {
    var image = this.data.images[index]

    wx.uploadFile({
      url: app.globalData.api.URI + '/articles/uploadImage',
      filePath: image.src,
      formData: {
        api_token: wx.getStorageSync('api_token')
      },
      name: 'image',
      complete: (res) => {
        var bool = false;

        if (res.statusCode == 200) {
          var data = JSON.parse(res.data);
          console.log(data)
          if (data.code == 0) {
            image.serverFilePath = data.data.file;
            bool = true;
          }
        }

        if (callback) {
          callback(bool);
        }
      }
    })
  },

  /**
   * 文章发布
   */
  submitPublish:function() {
    var api_token = wx.getStorageSync('api_token')
    var description = this.data.description
    var telphone = this.data.telphone
    var location = this.data.location
    var imagesArr = []
    for (var index = 0; index < this.data.images.length; index++) {
      var image = this.data.images[index]
      if (image.serverFilePath) {
        imagesArr.push(image.serverFilePath)
      }
    }
    var images = JSON.stringify(imagesArr)
    var user_id = app.globalData.userInfo.id

    app.globalData.api.publishArticles(api_token, user_id, description, telphone, location, images, cb_parms => {
      if (cb_parms.service_ok) {
        console.log(cb_parms.data)
        wx.showToast({
          title: '发布成功',
          duration: 1000,
          success: () => {
            this.resetPublish()

            wx.switchTab({
              url: '../../pages/index/index',
            })
          }
        })
      }

      wx.hideLoading()
    })
  },

  resetPublish:function() {
    this.data.name = ''
    this.data.description = ''
    this.data.images = []
    console.log('resetPublish')
    this.setData({
      description:'',
      location: '',
      images:[]
    })
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

    console.log("publish onShow..")
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
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