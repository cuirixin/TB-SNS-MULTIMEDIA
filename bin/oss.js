var conf = require('../config')
var ALY = require("aliyun-sdk");

// 线下环境是香港OSS
endpoint = 'http://oss-cn-beijing.aliyuncs.com';

// 线上环境是香港OSS
if(process.env.NODE_ENV == 'production'){
  endpoint = 'http://oss-cn-hongkong-internal.aliyuncs.com';
}

var oss = new ALY.OSS({
  accessKeyId: conf.aly.user.tbx_platform.accessKeyId,
  secretAccessKey: conf.aly.user.tbx_platform.secretAccessKey,
  // 根据你的 oss 实例所在地区选择填入
  // 杭州：http://oss-cn-hangzhou.aliyuncs.com
  // 北京：http://oss-cn-beijing.aliyuncs.com
  // 青岛：http://oss-cn-qingdao.aliyuncs.com
  // 深圳：http://oss-cn-shenzhen.aliyuncs.com
  // 香港：http://oss-cn-hongkong.aliyuncs.com
  // 注意：如果你是在 ECS 上连接 OSS，可以使用内网地址，速度快，没有带宽限制。
  // 杭州：http://oss-cn-hangzhou-internal.aliyuncs.com
  // 北京：http://oss-cn-beijing-internal.aliyuncs.com
  // 青岛：http://oss-cn-qingdao-internal.aliyuncs.com
  // 深圳：http://oss-cn-shenzhen-internal.aliyuncs.com
  // 香港：http://oss-cn-hongkong-internal.aliyuncs.com
  endpoint: endpoint,
  // 这是 oss sdk 目前支持最新的 api 版本, 不需要修改
  apiVersion: '2013-10-15'
});

module.exports = oss;