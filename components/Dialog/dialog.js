// 如何编写自定义组件：https://www.jianshu.com/p/8a2a730d9e60

// components/Dialog/dialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 弹窗标题
    title: {            // 属性名
      type: String,     // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '标题'     // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    // 提示内容
    contentText: {
      type: String,
      value: '内容'
    },
    // 弹窗取消按钮文字
    cancelText: {
      type: String,
      value: '取消'
    },
    // 弹窗确认按钮文字
    confirmText: {
      type: String,
      value: '确定'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 弹窗显示控制
    isShow: false,
    article_id: '',
    telphone: '',
    message: ''
  },

  /**
   * 组件的方法列表 bind:xxxx
   */
  methods: {
    /*
     * 公有方法
     */

    //隐藏弹框
    hideDialog() {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    //展示弹框
    showDialog(article_id, is_subscribe, telphone, message) {
      var content = ''
      if(is_subscribe) {
        content = '提示：已关注过，可修改您的电话或留言'
      } else {
        content = '提示：填写电话或留言，能让对方找到你哦~'
      }

      this.setData({
        isShow: !this.data.isShow,
        article_id: article_id,
        contentText: content,
        telphone: telphone,
        message: message
      })
    },
    /*
    * 内部私有方法建议以下划线开头
    * triggerEvent 用于触发事件
    */
    do_cancel() {
      //触发取消回调
      this.triggerEvent("cancel")
    },

    do_confirm(event) {
      console.log(event)

      var eventDetail = {
        telphone: this.data.telphone,
        message: this.data.message,
        article_id: this.data.article_id
      }

      this.triggerEvent("confirm", eventDetail, null);
    },

    // 输入电话号码
    input_phone(event) {
      this.setData({
        telphone: event.detail.value
      })
    },

    // 输入留言
    input_message(event) {
      this.setData({
        message: event.detail.value
      })
    }
  }
})
