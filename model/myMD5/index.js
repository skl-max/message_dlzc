var crypto = require("crypto");
/**
 * 将传进来的字符串进行加密
 * @param {string} msg 将要被加密的原数据
 * @returns 返回密文
 */
exports.md5 = function(msg){
  // 第一次加密
  var code = crypto.createHash("md5").update(msg).digest("base64");
  // 对第一次得到的密文处理
  code = code.substring(4,17);
  // 加盐
  code = "www."+code+".com";
  // 再加密
  code = crypto.createHash("md5").update(code).digest("base64");
  return code;
}