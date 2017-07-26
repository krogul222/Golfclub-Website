var mongojs = require('mongojs');
var express = require('express');
var db = mongojs('mongodb://golf:nexperia@ds123193.mlab.com:23193/nexperiagolfsociety', ['account']);

var app = express();
var server = require('http').Server(app);

app.use(express.static('public'));

var listener = server.listen(process.env.PORT || 3000, function(){ 
     console.log("Listening on port", listener.address().port); 
 }); 


const SOCKET_LIST = {};

let io = require('socket.io')(server,{}); 
io.sockets.on('connection', function(socket){ 
    console.log("Socket connection"); 
    socket.id = Math.random(); 
    SOCKET_LIST[socket.id] = socket; 

});
