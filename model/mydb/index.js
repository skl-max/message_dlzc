// 封装数据库的CRUD操作
var mongoose = require("mongoose");
var config = require("./config.js");
var models = require("./models.js");

var ip = config.address;
var port = config.port;
var dbName = config.dbName;
var url = "mongodb://"+ip+":"+port+"/"+dbName;

// 连接数据库
var opt = {useNewUrlParser: true,useUnifiedTopology:true};
mongoose.connect(url,opt);



/**
 * 新增数据
 * @param {mongoose.Model} model 表示某一个对应集合的模型
 * @param {JSON} data 表示将要保存进去的数据
 * @param {Function} callback 回调函数
 */
function add(model, data, callback){
  var o = new model(data);
  o.save(function(err,doc){
    callback(err,doc);
  });
}

/**
 * 根据给定的条件删除指定集合中的数据
 * @param {mongoose.Model} model 集合对应的模型
 * @param {JSON} filter 删除的条件
 * @param {Function} callback 回调函数
 */
function remove(model,filter,callback){
  filter._id = mongoose.Types.ObjectId(filter._id);
  model.deleteOne(filter,function(err){
    callback(err);
  })
}

/**
 * 修改数据
 * @param {mongoose.Model} model 修改的集合
 * @param {JSON} filter 修改的条件
 * @param {JSON} data 修改的数据
 * @param {Function} callback 回调函数
 */
function modify(model,filter,data,callback){
  // 将条件中的字符串_id转换为objectID类型
  filter._id = mongoose.Types.ObjectId(filter._id);
  model.updateOne(filter,{$set:data}, function(err,raw){
    callback(err,raw);
  })
}

/**
 * 查询数据
 * @param {mongoose.Model} model 集合名
 * @param {JSON} [filter] 条件
 * @param {Object} [option] 选项
 * @param {Number} [option.pageSize=5] 每页显示的条数
 * @param {Number} [option.page=1] 第几页
 * @param {Function} callback 回调函数
 */
function find(model,filter,option,callback){
  if(arguments.length==2){
    callback = filter;
    filter = {}; // 无条件
    option = {page:1,pageSize:5};
  }else if(arguments.length==3){
    callback = option;
    if(filter.hasOwnProperty("page")||filter.hasOwnProperty("pageSize")){
      // filter中含有page或pageSize其中一个属性
      // 说明filter是option
      option = filter;
      filter = {};
      // 重置option的值(防止其中只有一个属性,或属性值不合法)
      option.page = option.page || 1;
      option.pageSize = option.pageSize || 5;
      option.page = option.page<=0 ? 1 : option.page;
      option.pageSize = option.pageSize<=0 ? 5 : option.pageSize;
    }else{
      // filter就是一个条件
      // 重置option
      option = {page:1,pageSize:5};
    }
  }else if(arguments.length==4){
    option.page = option.page || 1;
    option.pageSize = option.pageSize || 5;
    option.page = option.page<=0 ? 1 : option.page;
    option.pageSize = option.pageSize<=0 ? 5 : option.pageSize;
  }else{
    throw new Error("参数个数错误");
  }
  // 将page和pageSize转换为skip和limit
  var skip = (option.page-1)*option.pageSize; // 跳过的数据条数
  var limit = option.pageSize; // 每次查询的条数
  var ops = {skip:skip,limit:limit};
  model.find(filter,null,ops,function(err,docs){
    callback(err,docs);
  })

}

/**
 * 数据的总条数
 * @param {mongoose.Model} model 集合
 * @param {Function} callback 回调
 */
function totals(model,callback){
  model.countDocuments({},function(err,count){
    callback(err,count);
  })
}



module.exports = {
  User: models.User,
  Message: models.Message,
  add: add,
  remove: remove,
  modify: modify,
  find: find,
  totals: totals
}