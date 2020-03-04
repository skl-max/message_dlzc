const router = require("express").Router();
const sd = require("silly-datetime");
const db = require("../model/mydb");

const User = db.User;
const Message = db.Message;

//  /message/show请求,展示留言板的主页面
router.get("/show",function(req,res){
  // 获取登录用户的信息(请求能进入这里,说明肯定是登录的,如果没登录,在前面就会被拦截下来)
  var username = req.session.username;
  // 获取第几页
  var page = parseInt(req.query.page);
  // 获取留言信息
  db.find(Message,{page:page},function(err,msgs){
    if(err){
      console.log(err);
      res.render("error",{msg:"网络故障,稍后再试"});
      return ;
    }
    // 所有用户的信息
    db.find(User,function(err,users){
      if(err){
        console.log(err);
        res.render("error",{msg:"网络故障,稍后再试"});
        return ;
      }
      db.totals(Message,function(err,count){
        if(err){
          console.log(err);
          res.render("error",{msg:"网络故障,稍后再试"});
          return ;
        }
        // 获得总条数count
        var totalPage = Math.ceil(count/5);
        // 返回数据: msgs,users,username,totalPage
        res.render("index",{msgs:msgs,users:users,username:username,totalPage:totalPage});
      });
    });
  });
  
});

// get /message/add请求, 登录的用户发表留言
router.get("/add",function(req,res){
  // 获取登录的用户名
  var username = req.session.username;
  // 获取发表的留言内容
  var message = req.query.msg;
  // 获取留言的时间
  var datetime = sd.format(new Date(),"YYYY-MM-DD HH:mm");
  var data = {username:username,message:message,datetime:datetime};
  // 将数据保存到数据库
  db.add(Message,data,function(err,doc){
    if(err){
      console.log(err);
      res.render("error",{msg:"留言失败"});
      return ;
    }
    // 留言成功,回到首页
    res.redirect("/");
  });
});

// get /message/del请求,根据传递的id删除指定的留言
router.get("/del",function(req,res){
  var id = req.query.id; // 字符串格式
  // 在封装的模块删除数据的方法中,已经对参数id做了一个格式转换
  db.remove(Message,{_id:id},function(err){
    if(err){
      console.log(err);
      res.render("error",{msg:"删除留言失败"});
      return ;
    }
    // 删除成功
    res.redirect("/");
  })
});



module.exports = router;