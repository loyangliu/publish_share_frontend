var api = require('../../common/api.js');
var auth = require('../../common/auth.js')

// components/article/article.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    article: {
      type: Object,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    follow: function(e){
      var userId = e.target.dataset.userId

      api.request({
        method: 'POST',
        url: 'user/follow',
        data: {
          userId:userId
        },
        success: (res) => {

        }
      });
    }
  }
})
