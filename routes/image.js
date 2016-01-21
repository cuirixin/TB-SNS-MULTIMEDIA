var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');  
var fs = require('fs')
var multiparty = require('multiparty');
//var images = require('images');
var gm = require('gm'); // yum install ImageMagick
var redis = require('redis');
var config = require('../config');

var redis_cli = redis.createClient(config.redis_url);
var channel = config.queue_channel.up_oss_image;

router.post('/upload/common', function (req, res, next) {

    // 上传图片, 到uploads/image目录

    var form = new multiparty.Form();

    //设置编辑
    form.encoding = 'utf-8';
    //设置文件存储路径
    form.uploadDir = __dirname + "/../uploads/images/";
    //设置单文件大小限制
    form.maxFilesSize = 2 * 1024 * 1024;
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

      files.upload.forEach(function(file){
        try{
          var img_uuid = uuid.v1().replace(/-/g, "") + parseInt(Math.random()*100000);
          var file_name = file.originalFilename;

          /*

          switch (file.headers['content-type']) {
              case 'image/pjpeg':extension_name = 'jpg';
                  break;
              case 'image/jpeg':extension_name = 'jpg';
                  break;
              case 'image/gif':extension_name = 'gif';
                  break;
              case 'image/png':extension_name = 'png';
                  break;
              case 'image/x-png':extension_name = 'png';
                  break;
              case 'image/bmp':extension_name = 'bmp';
                  break;
              default:
                  throw new Error('File format error.');
          }

          */

          //console.log(file.originalFilename);
          //console.log(file.path);

          var imageMagick = gm.subClass({ imageMagick: true });
          var target = imageMagick(file.path);

          var width = 0;
          var height = 0;

          target.size(function(err, value){

            if(err){
              throw new Error('File not a image.');
            }
            width = value.width;
            height = value.height;

            var o_maxsize = parseFloat(width >= height ? width:height);
            var scale = 1.0;

            var limage_name = img_uuid+".jpg";
            var limage = form.uploadDir+limage_name;
            var simage_name = img_uuid+"_s.jpg";
            var simage = form.uploadDir+simage_name;

            if(o_maxsize <= 400){
              target.write(limage, function(){
                // Important!!! 这里注意发布消息必须用JSON.stringify处理
                redis_cli.publish(channel, JSON.stringify({"path": limage, "key": limage_name}));
                fs.unlinkSync(file.path);
              });
              target.write(simage, function(){
                redis_cli.publish(channel,  JSON.stringify({"path": simage, "key": simage_name}));
              });
            }

            else if(o_maxsize <= 600){
              target.write(limage, function(){
                redis_cli.publish(channel,  JSON.stringify({"path": limage, "key": limage_name}));
                fs.unlinkSync(file.path);
              });
              scale = o_maxsize/400.0;
              target.resize(parseInt(width/scale), parseInt(height/scale)).autoOrient().write(simage, function(){
                redis_cli.publish(channel,  JSON.stringify({"path": simage, "key": simage_name}));
              })
            }

            else if(o_maxsize > 600){
              scale = o_maxsize/600;
              target.resize(parseInt(width/scale), parseInt(height/scale)).autoOrient().write(limage, function(){
                redis_cli.publish(channel,  JSON.stringify({"path": limage, "key": limage_name}));
                fs.unlinkSync(file.path);
              })

              scale = o_maxsize/400.0;
              target.resize(parseInt(width/scale), parseInt(height/scale)).autoOrient().write(simage, function(){
                redis_cli.publish(channel,  JSON.stringify({"path":simage, "key": simage_name}));
              })
            }

          });
          
          total++;
          suc_num++;
          uuids.push(img_uuid);

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
          "uuids": uuids
        }
      });
    });


    // 压缩与生成缩略图

    // 入传输队列

    

});

module.exports = router;
