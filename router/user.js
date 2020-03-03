// 用户相关的路由模块
const router = require("express").Router();
const md5 = require("../model/myMD5");
const db = require("../model/mydb");

const User = db.User; // 获取User对应的model

// get的/user/login请求,跳转到登录页面
router.get("/login",function(req,res){
  res.render("login");
});

// post的/user/login请求,处理登录操作
router.post("/login",function(req,res){
  // 获取用户名和密码
  var username = req.body.username;
  var password = req.body.password;
  // 对密码加密
  password = md5.md5(password);
  console.log(password);
  // 到数据库查询验证,用户名和密码是否正确
  // 查询条件
  var filter = {username:username,password:password};
  db.find(User,filter,function(err,docs){
    if(err){
      console.log(err);
      // 将错误信息发送给ajax
      res.send({status: 2, msg: "网络波动,稍后再试"});
      return ;
    }
    if(docs.length==0){
      res.send({status: 1, msg: "用户名或密码错误"});
      return ;
    }
    // 用户名密码正确,登录成功
    req.session.username = username; // 保存登录状态
    res.send({status: 0, msg: "登录成功"});
  });
});


module.exports = router;