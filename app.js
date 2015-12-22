var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var ejs = require('ejs');

var config = require('./config');

var image = require('./routes/image');
var secure = require('./routes/secure');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

app.use('/image', image);
app.use('/secure', secure);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}else{
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: ""
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(config.port, function() {
    var date = new Date();
    var log = '\n';
    log += '------------------------------------------------------------\n';
    log += '\tExpress server listening on port '+config.port+'\n';
    log += '\tStart time: ' + date + '\n';
    log += '\tEnvironment: ' + app.settings.env + '\n';
    log += '------------------------------------------------------------\n';
    console.log(log);
});

// important!!! 防止异常后中断
process.on('uncaughtException', function (err) {
  //打印出错误
  console.log(err);
});

module.exports = app;
