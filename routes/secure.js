var express = require('express');
var router = express.Router();
var fs = require('fs')
//var images = require('images');
var config = require('../config');
var ALY = require("aliyun-sdk");

var work_engine = require("../bin/work_engine");

router.get('/sts', function (req, res, next) {

  //console.log(req.query.s.role);

  work_engine.get_aliyun_sts(function(err, data){
    if(err){
      res.status(200).send({
        "code": -1, 
        "message": "Fail", 
        "data": null
      });
    }else{
      res.status(200).send({
        "code": 0, 
        "message": "Success", 
        "data": data
      });
    }
    
  });
});

module.exports = router;
