/**
 * 访问远程接口API
 * https://www.loyangliu.com/api/articles/home?page=6
 */

module.exports = function(url, path, parms, method="GET") {
  var promise = new Promise(
    (resolve, reject) => {
      console.log('a');
      wx.request({
        url: url + '/' + path,
        method: method,
        data: Object.assign({}, parms),
        header: { 'Content-Type': 'application/x-www-form-urlencoded' },
        success: resolve,
        fail: reject
      })
    }
  )

  return promise
}