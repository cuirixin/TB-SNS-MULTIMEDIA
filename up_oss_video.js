/**
* 上传OSS服务
*/

var redis = require('redis');
var bunyan = require('bunyan');
var fs = require('fs')
var work_engine = require('./bin/work_engine');
var log = bunyan.createLogger({
    name: 'up_oss_video',
    streams: [
        {
            /*
            level: 'info',
            path: './logs/up_oss_image_info.log',
            type: 'rotating-file',
            period: '1d',   // daily rotation 
            count: 30        // keep 30 back copies 
            */
          stream: process.stdout            // log INFO and above to stdout 
        },
        {
          level: 'error',
          //path: './logs/up_oss_image_error.log'  // log ERROR and above to a file 
          stream: process.stderr
        }
    ]
});

var conf = require('./config');
var engine = require('./bin/work_engine');

var redis_cli = redis.createClient(conf.redis_url);

// 上传到OSS
var channel = conf.queue_channel.up_oss_video;

redis_cli.subscribe(channel);

redis_cli.on("subscribe", function (channel) {
    log.info("Subscribe topic:" + channel);
});
 
redis_cli.on("message", function (channel, message) {
    var msg = JSON.parse(message.toString());

    var bucket = conf.aly.oss.bucket.video;
    var options = {
        path: msg.path,
        key: msg.key,
        bucket: bucket,
        type: 'video'
    }

    work_engine.put_object(options, function(err, path){
        if(err){
            return;
        }
        console.log("Delete :", path);
        fs.unlink(path);
    })

});

// Important!!! 防止异常中断
process.on('uncaughtException', function (err) {
  //打印出错误
  log.info(err);
  //打印出错误的调用栈方便调试
  log.info(err.stack);
});
