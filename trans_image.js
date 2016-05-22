
var fs = require("fs");
var work_engine = require('./bin/work_engine');
var conf = require('./config');

var path = "/mnt/resource/uploads/image/57";



function executeFunc(files, index, sum){
  if(index == sum){
     return ; 
   }
   else{

        index++;
        var item = files[index-1];
        var tmpPath = path + '/' + item;  
        var options = {
            path: tmpPath,
            key: item,
            bucket: 'tb-image-1',
            type: 'image'
        }

        if (item.indexOf('_120.jpg') != -1) {
            return executeFunc(files, index, sum)
        }
        else if (item.indexOf('_400.jpg') != -1) {
            options.key = item.split("_")[0] + '_s.jpg';
        }

        // console.log(options);

        work_engine.put_object(options, function(err, path){
            if(err){
                return;
            }
            console.log("Success",options.path,options.key);
            executeFunc(files, index, sum)
        })
   }  
}

fs.readdir(path, function(err, files) {  
    if (err) {  
        console.log('read dir error');  
    } else {  
        var num = files.length;

        if (num > 0) {
            executeFunc(files, 0, num)
        }

    }  
});  

