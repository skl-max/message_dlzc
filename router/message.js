const router = require("express").Router();
const db = require("../model/mydb");

const User = db.User;

//  /message/show请求,展示留言板的主页面
router.get("/show",function(req,res){
  // 获取登录用户的信息(请求能进入这里,说明肯定是登录的,如果没登录,在前面就会被拦截下来)
  var username = req.session.username;
  db.find(User,{username:username},function(err,docs){
    if(err){
      console.log(err);
      // 网络错误,跳转到专门处理错误的页面
      res.render("error",{msg: "网络波动"});
      return ;
    }
    if(docs.length==0){
      // 登录失效(有登录信息,但是数据库中没有该用户)
      // 销毁失效的session,让用户重新登录
      req.session.destroy(function(err){
        if(err){
          console.log(err);
          res.render("error",{msg:"登录失效"});
          return ;
        }
        // 销毁session成功
        res.redirect("/");
      });
      return ;
    }
    // 查到数据,将用户的信息返回给首页
    res.render("index",{user:docs[0]});
  });
  
});





module.exports = router;