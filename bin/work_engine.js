var conf = require('../config');
var fs = require('fs');
var assert = require('assert-plus');
var sts = require('./sts');
var oss = require('./oss');


/**
* 即时消息
*/
exports.user_im = function (uid, msg) {
	console.log("Engine user_im");
	var topic = "noti/"+uid;
	var message = {
		"code": global.Sys.cont.CODE_USER_IM, 
		"module": global.Sys.cont.MODULE_IM
	};
	exports._publish_mqtt(topic, message);
};


/**
* 获取阿里云STS凭证, 存储到本地
*/
exports.refresh_aliyun_sts = function(callback) {
	console.log("Trigger Refresh STS!!!");
	// 构造AssumeRole请求

	var policy = {
		"Version": "1",
		"Statement": [
		{
		  "Action": [
		    "oss:GetObject",
		    "oss:PutObject",
		    "oss:GetBucket",
		  ],
		  "Resource": "*",
		  "Effect": "Allow"
		}
		]
	};
	sts.assumeRole({
	      Action: 'AssumeRole',
	      // 指定角色Arn
	      RoleArn: 'acs:ram::1427597454487601:role/ossmanager',
	      //设置Token的附加Policy，可以在获取Token时，通过额外设置一个Policy进一步减小Token的权限；
	      //Policy: '{"Version":"1","Statement":[{"Effect":"Allow", "Action":"*", "Resource":"*"}]}',
	      //设置Token有效期，可选参数，默认3600秒；
	      Policy: JSON.stringify(policy),
	      DurationSeconds: 3600,
	      RoleSessionName: 'platform_001'
	}, function (err, res) {
		if(err){
			console.log(err);
			return callback(err, null);
		}
		var sts_path = './sts.data';
		res.timestamp = new Date().getTime();
	    fs.writeFile(sts_path, JSON.stringify(res), function (err) {
	        if (err) {
	            throw new Error("Save STS Error");
	        }
	        return callback(null, res);
	    });
		
	});
}


/**
* 获取阿里云STS凭证，如果已超时则重新获取
*/
exports.get_aliyun_sts = function(callback) {
	var sts_path = './sts.data';
	// readFile的第2个参数表示读取编码格式，如果未传递这个参数，表示返回Buffer字节数组  
    fs.readFile(sts_path, "utf8", function(err, data){  
        if(err){
        	console.log("读取文件fail " + err); 
        	return exports.refresh_aliyun_sts(callback);
        } 
        else{
            // 读取成功时  
            //console.log(data);
            try{
            	var sts = JSON.parse(data);
            	//console.log(new Date().getTime() - sts.timestamp);
            	// 过期时间验证比3600s稍短一些
            	if(new Date().getTime() - sts.timestamp > 3000 * 1000){
            		// 过期验证
            		throw new Error("Token Expires!")
            	}
            }catch(err){
            	return exports.refresh_aliyun_sts(callback);
            }
            return callback(null, JSON.parse(data));
        }  
    });
}

/**
* Put Object
*/
exports.put_object = function(options, callback) {

    assert.string(options.type, 'options.type');
	assert.string(options.path, 'options.path');
	assert.string(options.bucket, 'options.bucket');
	assert.string(options.key, 'options.key');

	fs.readFile(options.path, function (err, data) {
	  if (err) {
	    console.log('error:', err);
	    callback(err, options.path)
	  }

	  var bucket = options.bucket || 'test-tbx-image-1';
	  var key = options.key || 'test.data'

	  var ops = {
	      Bucket: bucket,
	      Key: key,                 // 注意, Key 的值不能以 / 开头, 否则会返回错误.
	      Body: data,
	      AccessControlAllowOrigin: '',
	      ContentType: 'text/plain',
	      CacheControl: 'no-cache',         // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9
	      ContentDisposition: '',           // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec19.html#sec19.5.1
	      ContentEncoding: 'utf-8',         // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.11
	      ServerSideEncryption: 'AES256',
	      Expires: null                     // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.21
	  };
	  if(options.type == 'image'){
	  	ops.ContentType = 'image/jpeg';
	  	ops.CacheControl = 'max-age=2592000';
	  }

	  oss.putObject(ops,
	    function (err, data) {

	      if (err) {
	        console.log('error:', err);
	        callback(err, options.path)
	      }

	      console.log('success:', data);
	      callback(null, options.path)
	    });
	});
	
}


//exports.put_object();



