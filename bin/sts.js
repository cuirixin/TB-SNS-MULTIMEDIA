var conf = require('../config')
var ALY = require("aliyun-sdk");

// 构建一个 Aliyun Client, 用于发起请求
// 构建Aliyun Client时需要设置AccessKeyId和AccessKeySevcret
// STS是Global Service, API入口位于杭州, 这里使用sts API的主地址
var sts = new ALY.STS({
      accessKeyId: conf.aly.user.tbx_platform.accessKeyId,
      secretAccessKey: conf.aly.user.tbx_platform.secretAccessKey,
      endpoint: 'https://sts.aliyuncs.com',
      apiVersion: '2015-04-01'
});

module.exports = sts;
