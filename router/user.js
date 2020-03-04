// 用户相关的路由模块
const router = require("express").Router();
const md5 = require("../model/myMD5");
const db = require("../model/mydb");
const fd = require("formidable");
const fs = require("fs");
const gm = require("gm");

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
  // console.log(password);
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

// get /user/center请求,跳转到个人中心页面
router.get("/center",function(req,res){
  var username = req.session.username;
  // console.log(username);
  // 获取当前登录用户的所有信息
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
    // 查到数据,将用户的信息返回给页面
    res.render("center",{user:docs[0]});
  });
});

// get /user/changeNickname请求,修改昵称
router.get("/changeNickname", function(req,res){
  // 获取登录用户
  var username = req.session.username;
  // 获取参数:新的昵称
  var newNick = req.query.nickname;
  // 判断newNick是否存在
  // console.log(newNick);
  db.find(User,{nickname:newNick},function(err,docs){
    if(err){
      console.log(err);
      res.send({status:2,msg:"网络波动"});
      return ;
    }
    // console.log(docs);
    if(docs.length>0){
      // 找到数据,新的昵称已经存在
      res.send({status:1, msg:"昵称已存在"});
      return ;
    }
    // 昵称不存在,可以使用
    // 更新数据
    var filter = {username:username};
    var data = {nickname:newNick};
    console.log(filter);
    console.log(data);
    db.modify(User,filter,data,function(err,raw){
      if(err){
        console.log(err);
        res.send({status:2,msg:"网络波动"});
        return ;
      }
      if(raw.nModified==0){
        res.send({status: 3, msg: "修改失败"});
        return ;
      }
      res.send({status:0, msg: "修改成功"});
    });
  });
});

// get /user/changePwd,修改密码
router.get("/changePwd",function(req,res){
  // 获取登录用户名
  var username = req.session.username;
  // 获取新密码
  var newPwd = req.query.pwd;
  // 加密新密码
  newPwd = md5.md5(newPwd);
  // 修改密码
  db.modify(User,{username:username},{password:newPwd},function(err,raw){
    if(err){
      console.log(err);
      res.send({status:2,msg:"网络波动"});
      return ;
    }
    if(raw.nModified==0){
      res.send({status:1,msg:"修改失败"});
      return ;
    }
    // 修改成功,重新登录
    req.session.destroy(function(err){
      if(err){
        console.log(err);
        res.send({status:0,msg:"请重新登录"});
        return ;
      }
      res.send({status:0,msg:"修改成功"});
    })
  });
});

// get /user/upload ,跳转到上传图片的页面
router.get("/upload",function(req,res){
  res.render("upload");
});

// post /user/upload请求,处理图片的上传
router.post("/upload",function(req,res){
  // 取登录的用户名
  var username = req.session.username;
  // 使用formidable处理图片
  var form = new fd.IncomingForm();
  // 将uploads文件夹设置为图片上传临时保存路径
  form.uploadDir = "./uploads";
  // 解析请求
  form.parse(req,function(err,fields,files){
    if(err){
      console.log(err);
      res.render("error",{msg:"上传图片失败"});
      return ;
    }
    var pic = files.pic; // 上传的图片
    // 取上传图片保存的路径以及图片的原名称
    var oldName = pic.name;
    var oldPath = pic.path;
    var arr = oldName.split(".");
    var ext = arr[arr.length-1];
    var newName = username+"."+ext; // 用户名.jpg
    // 改名
    fs.rename(oldPath,"uploads/"+newName,function(err){
      if(err){
        console.log(err);
        res.render("error",{msg:"上传失败"});
        return ;
      }
      // 修改图片成功,跳转到剪切图片的页面
      res.render("cut",{pic:newName});
    })
  });
});

// get /user/cut请求,根据传递的参数剪切图片
router.get("/cut", function(req,res){
  // 取参数
  var username = req.session.username;
  var query = req.query; // {w:w,h:h,x:x,y:y,img:img}
  var w = parseInt(query.w),     
      h = parseInt(query.h),
      x = parseInt(query.x),
      y = parseInt(query.y),
      img = query.img; //  /xxx.jpg
  // var {w,h,x,y,img} = query;
  // 剪切图片
  var arr = img.split(".");
  var ext = arr[arr.length-1];
  var path = "./avatar/avatar_"+username+"."+ext;
  gm("./uploads"+img).crop(w,h,x,y).write(path,function(err){
    if(err){
      console.log(err);
      res.send({status:1,msg:"修改失败"});
      return ;
    }
    // 剪切成功,修改数据库中头像的保存路径
    var newPath = "/avatar_"+username+"."+ext; // /avatar_xxxx.jpg
    db.modify(User,{username:username},{avatar:newPath},function(err,raw){
      if(err){
        console.log(err);
        res.send({status:1,msg:"修改失败"});
        return ;
      }
      res.send({status:0,msg:"修改成功"});
    })

  })

});

// get /user/logout请求,退出登录
router.get("/logout",function(req,res){
  // 清除登录信息
  req.session.destroy(function(err){
    if(err){
      console.log(err);
      res.redirect("/");
      return ;
    }
    res.redirect("/");
  });
});

// get /user/regist请求, 跳转到注册页面
router.get("/regist",function(req,res){
  res.render("regist");
});

// post /user/regist请求, 用户注册
router.post("/regist",function(req,res){
  // 获取参数
  var username = req.body.username;
  var password = req.body.password;
  // 判断username是否存在
  db.find(User,{username:username},function(err,docs){
    if(err){
      console.log(err);
      res.send({status:2,msg:"注册失败"});
      return ;
    }
    if(docs.length>0){
      // 找到了数据,username已经存在
      res.send({status:1,msg:"用户名已存在"});
      return ;
    }
    // docs长度为0,没找到数据,用户名可以使用
    // 对密码加密
    password = md5.md5(password);
    var data = {username:username,password:password,nickname:username};
    db.add(User,data,function(err,doc){
      if(err){
        console.log(err);
        res.send({status:2,msg:"注册失败"});
        return ;
      }
      // 注册成功
      // 保存登录状态(注册成功之后,自动登录)
      req.session.username = username;
      res.send({status:0,msg:"注册成功"});
    })
  });
})


module.exports = router;