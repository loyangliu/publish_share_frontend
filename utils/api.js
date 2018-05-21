/**
 * 请求 www.loyangliu.com 的业务接口
 * 
 */

//const URI = wx.getSystemInfoSync().brand == 'devtools' ? 'http://www.loyangliu.com/index.php/api' : 'https://www.loyangliu.com/api'
const URI = 'https://www.loyangliu.com/api'
const fetch = require('fetch')


/**
 * 接口数据获取封装（通用）
 */
function commonFetch(path, parms, method="GET") {
  var cb_parms = {
    service_ok: true,  // 网络接口正常返回 statusCode: 200
    data: null          // 业务返回数据
  }

  return fetch(URI, path, parms, method).then(res => {
    //res = {data: {…}, header: {…}, statusCode: 200, errMsg: "request:ok"} 作为整个http响应报文
    //res.data = { code: 0, msg: null, data: { … } } 作为应用的响应

    if (res.statusCode == 200) {
      cb_parms.service_ok = true
      cb_parms.data = res.data
    } else {
      cb_parms.service_ok = false
      cb_parms.data = null
    }

    return cb_parms
  })
}

/**
 * 登录态验证
 */
function authCheck(api_token, callback) {
  const parms = {
    api_token: api_token
  }

  commonFetch('auth/check', parms).then(
    cb_parms => {
      callback(cb_parms)
    }
  )
}

/**
 * 用户登录鉴权
 */
function doLogin(code, encryptedData, iv, callback) {
  const parms = {
    code: code,
    encryptedData: encryptedData,
    iv: iv
  }

  commonFetch('auth/login', parms, "POST").then(
    cb_parms => {
      callback(cb_parms)
    }
  )
}

/**
 * 获取帖子列表
 */
function fetchArticles(userid, page, pagesize, cursor, callback) {
  const parms = {
    userid: userid,
    page:page,
    pagesize: pagesize,
    offsetId:cursor
  }

  commonFetch('articles/home', parms).then(
    cb_parms=>{
      callback(cb_parms)
    }
  )
}

/**
 * 发布帖子
 */
function publishArticles(api_token, user_id, description, telphone, location, images, callback){
  const parms = {
    api_token: api_token,
    userid:user_id,
    description: description,
    telphone: telphone,
    location: location,
    images: images
  }

  commonFetch('articles/publish', parms, "POST").then(
    cb_parms => {
      callback(cb_parms)
    }
  )
}  

/**
 * 发布评论
 */
function publishComments(api_token, article_id, _from, _fromuserid, _to, _touserid, message, callback){
  const parms = {
    api_token: api_token,
    article_id: article_id,
    'from': _from,
    'from_userid': _fromuserid,
    'to': _to,
    'to_userid': _touserid,
    message: message
  }

  commonFetch('comments/publish', parms, "POST").then(
    cb_parms => {
      callback(cb_parms)
    }
  )
}

/**
 * 获取评论列表
 */
function fetchComments(article_id, callback) {
  const parms = {
    article_id: article_id
  }

  commonFetch('comments/get', parms).then(
    cb_parms => {
      callback(cb_parms)
    }
  )
}

/**
 * 点赞帖子
 */
function priseArticle(api_token, article_id, from, callback){
  const params = {
    api_token: api_token,
    article_id: article_id,
    from: from
  };

  commonFetch('comments/prise', params, "POST").then(
    cb_parms => {
      callback(cb_parms)
    }
  )
}

// 关注帖子
function toggleSubscribeArticle(api_token, article_id, telphone, message, action, callback) {
  const params = {
    api_token: api_token,
    article_id: article_id,
    telphone: telphone,
    message: message
  };

  commonFetch('articles/' + action, params, "POST").then(
    cb_parms => {
      callback(cb_parms)
    }
  )
}

// 我的Num信息
function mineBasicInfo(api_token, callback) {
  const params = {
    api_token: api_token
  };

  commonFetch('mine/home', params).then(
    cb_parms => {
      callback(cb_parms)
    }
  )
}

// 我的发布
function minePublish(api_token, page, page_size, callback) {
  const params = {
    api_token: api_token,
    page: page,
    page_size: page_size
  };

  commonFetch('mine/myPublish', params).then(
    cb_parms => {
      callback(cb_parms)
    }
  )
}

// 我的关注
function mineSubscribe(api_token, callback) {
  const params = {
    api_token: api_token
  };

  commonFetch('mine/mySubscribe', params).then(
    cb_parms => {
      callback(cb_parms)
    }
  )
}

module.exports = {
  URI,

  //鉴权
  authCheck,
  doLogin,

  // 帖子
  fetchArticles,
  publishArticles,
  toggleSubscribeArticle, // 关注或取消关注

  // 评论
  publishComments,
  fetchComments,
  priseArticle,

  // 我的
  mineBasicInfo,
  minePublish,
  mineSubscribe
}
