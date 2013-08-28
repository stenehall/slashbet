/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
//var fs = require('fs');

var app = express();

// global.betsFile = 'db/bets.js';
// global.bets = {};


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.session({ secret: 'slashats-super-duper-secret-needs-to-be-updated' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/media", express.static(__dirname + '/media'));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// fs.exists(betsFile, function (exists) {
//   if (exists) {
//     fs.readFile(betsFile, function (err, data) {
//       if (err) throw err;
//       bets = JSON.parse(data);
//     }.bind(this));
//   } else {
//     fs.mkdirSync('db');
//   }
// }.bind(this));


app.get('/', routes.index);
app.post('/post', routes.post);
app.get('/:hash', routes.single);
app.get('/:hash/:vote', routes.vote);



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

