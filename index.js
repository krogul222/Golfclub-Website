var mongojs = require('mongojs');
var express = require('express');
//var db = mongojs('mongodb://golf:nexperia@ds123193.mlab.com:23193/nexperiagolfsociety', ['account']);

var db = mongojs('localhost:27017/golf', ['account']);

//db.account.remove();
/*
db.account.insert({username:"johnhart", name: "John Hart", password: "johnhart", email: "johnymike@hotmail.com", phone: "07930980836", committee: "true", position: "President", handicapPlaying: "14", handicapExact: "14.2"});

db.account.insert({username:"garynorton", name: "Gary Norton", password: "garynorton", email: "", phone: "", committee: "true", position: "Treasurer", handicapPlaying: "22", handicapExact: "22" });

db.account.insert({username:"tonylyons", name: "Tony Lyons", password: "tonylyons", email: "", phone: "", committee: "true", position: "Handicap Chairman", handicapPlaying: "12", handicapExact: "12.3" });

db.account.insert({username:"craighulton", name: "Craig Hulton", password: "craighulton", email: "", phone: "", committee: "true", position: "Capitan", handicapPlaying: "19", handicapExact: "19.4" });

db.account.insert({username:"paulcraneybarnie", name: "Paul Craney Barnie", password: "paulcraneybarnie", email: "paulbarniedecor@sol.com", phone: "07402958921", committee: "true", position: "Handicap Secratary", handicapPlaying: "8", handicapExact: "8" });
*/

var app = express();
var server = require('http').Server(app);

app.use(express.static('public'));

var listener = server.listen(process.env.PORT || 2000, function(){ 
     console.log("Listening on port", listener.address().port); 
 }); 


const SOCKET_LIST = {};

let io = require('socket.io')(server,{}); 
io.sockets.on('connection', function(socket){ 
    console.log("Socket connection"); 
    socket.id = Math.random(); 
    SOCKET_LIST[socket.id] = socket; 

    socket.on('dataRequest',function(data){ 
         switch(data){
             case "committee":
                 console.log("committee request sent");
                  db.account.find({committee: "true"}, function(err, res){
                    socket.emit('committeeData',res);
                      console.log("committee data sent");
                  });
                 break;
            }
     }); 

    
});
