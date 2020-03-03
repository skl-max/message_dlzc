// 定义并暴露model
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

// message对应的Schema
var message = new Schema({
  username:String,
  message: String,
  datetime: String
},{collection: "message"});

// user对应的Schema
var user = new Schema({
  username: String,
  nickname: String,
  password: String,
  avatar: {type: String,default:"/img/avatar.jpg"}
})

// 暴露model
module.exports = {
  Message: mongoose.model("msg",message),
  User: mongoose.model("user",user)
}
