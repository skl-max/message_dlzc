// 登录检查
// 检查用户是否已经登录,如果没有登录,则跳转到登录页面

exports.check = function(req,res,next){
  // 获取session中保存的username数据
  var username = req.session.username;
  // 请求放行的几个条件: 
  // 已经登录(username有值),访问/user/login请求,/user/regist
  // 获取请求地址:
  var path = req._parsedUrl.pathname;
  if(username || path=="/user/login" || path=="/user/regist"){
    next();
  }else{
    // 未登录,也不是登录注册的请求,跳转到登录页面
    res.render("login");
  }
}

