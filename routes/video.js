var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');  
var fs = require('fs');
var path = require('path');
var multiparty = require('multiparty');
//var images = require('images');
var gm = require('gm'); // yum install ImageMagick
var redis = require('redis');
var config = require('../config');

var redis_cli = redis.createClient(config.redis_url);
var channel = config.queue_channel.up_oss_video;

router.post('/upload/common', function (req, res, next) {

    // 上传图片, 到uploads/image目录

    var form = new multiparty.Form();

    //设置编辑
    form.encoding = 'utf-8';
    //设置文件存储路径
    form.uploadDir = __dirname + "/../uploads/videos/";
    //设置单文件大小限制
    form.maxFilesSize = 10 * 1024 * 1024;
    //form.maxFields = 1000;  设置所以文件的大小总和


    form.parse(req, function(err, fields, files) {

      if (err) {
        console.log('Error parsing form: ' + err.stack);
        res.send({"code": -1, "message": "Failed."});
        //res.end();
        return;
      }

      var total = 0;
      var suc_num = 0;
      var err_num = 0;
      var uuids = [];
      var uuids_path = [];

      if (!files.upload || files.upload.length == 0 ){
        console.log('Param upload is required. ');
        res.send({"code": -1, "message": "Param upload is required. "});
        return;
      }

      files.upload.forEach(function(file){
        try{
          var video_uuid = uuid.v1().replace(/-/g, "") + parseInt(Math.random()*100000);
          var file_name = file.originalFilename;
          var file_path = file.path;

          //console.log(file_name);
          //console.log(file_path);

          var dirname = path.dirname(file_path);
          var extname = path.extname(file_name);

          switch (extname) {
              case '.mp4':
                  extension_name = 'mp4';
                  break;
              case '.asf':
                  extension_name = 'asf';
                  break;
              case '.swf':
                  extension_name = 'swf';
                  break;
              case '.mov':
                  extension_name = 'mov';
                  break;n
              case '.wmv':
                  extension_name = 'wmv';
                  break;
              case '.rm':
                  extension_name = 'rm';
                  break;
              case '.3gp':
                  extension_name = '3gp';
                  break;
                  
              default:
                  throw new Error('File format error.');
          }

          //console.log(dirname);
          //console.log(extname);

          var new_file_name = video_uuid + extname;
          var new_file_path = dirname+'/'+new_file_name;

          //console.log(new_file_name);
          //console.log(new_file_path);

          fs.renameSync(file_path, dirname+'/'+new_file_name)

          // Important!!! 这里注意发布消息必须用JSON.stringify处理
          redis_cli.publish(channel, JSON.stringify({"path": new_file_path, "key": new_file_name}));
          
          total++;
          suc_num++;
          uuids.push(new_file_name);

        }catch(err){
          err_num++;
          fs.unlinkSync(file.path);
          console.log('Error uploading image: ' + err.stack);
        }
      });

      //同步重命名文件名

      return res.status(200).send({
        "code": 0, 
        "message": "Success", 
        "data": {
          "total": total, 
          "suc_num": suc_num, 
          "err_num": err_num, 
          "files": uuids
        }
      });
    });
    

});

module.exports = router;
