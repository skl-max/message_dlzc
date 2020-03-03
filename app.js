// 启动文件,启动服务,监听端口
const express = require("express");
const bdParser = require("body-parser");
const session = require("express-session");
const app = express();

app.listen(4000);

// 设置视图模板引擎
app.set("view engine","ejs");

// 设置session
app.use(session({
  secret: "message",
  resave: false,
  saveUninitialized: true
}));

// 设置post请求参数解析方式
app.use(bdParser.urlencoded({extended:true}));

// 设置根目录
app.use(express.static("./public"));
app.use(express.static("./uploads"));
app.use(express.static("./avatar"));





