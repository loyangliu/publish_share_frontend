// components/modal/imodal.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    is_show:'none',
    callback:null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 通过 catchtouchmove 事件，空函数，不允许滑动
    prevent_move(event) {
      
    },

    // 打开 遮罩层
    showModal(callback) {
      this.setData({
        is_show: 'block',
        callback: callback
      })
    },

    // 隐藏 遮罩层
    hideview(event) {
      this.setData({
        is_show:'none'
      })
    },

    // 触发微信授权弹窗， 作为执行点击授权确定按钮后的回调函数
    wxauth(event) {
      this.hideview(event)
      console.log('========================')

      // 同步前后台用户登录态
      app.doLogin(this.data.callback)
    }
  }
})
