var db = require("./index.js");

var User = db.User;

var data = {
  username: "test",
  nickname: "张三",
  password: "123"
};





db.add(User,data,function(err,doc){
  console.log(err);
  console.log(doc);
})


