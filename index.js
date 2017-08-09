var mongojs = require('mongojs');
var express = require('express');
var db = mongojs('mongodb://golf:nexperia@ds123193.mlab.com:23193/nexperiagolfsociety', ['account', 'event']);

//var db = mongojs('localhost:27017/golf', ['account','event']);      // connect to database
/*
db.account.remove();

db.account.insert({username:"johnhart", name: "John Hart", password: "johnhart", email: "johnymike@hotmail.com", phone: "07930980836", committee: "true", position: "President", handicapExact: "14.2", account:"member", admin: "true"});

db.account.insert({username:"garynorton", name: "Gary Norton", password: "garynorton", email: "", phone: "", committee: "true", position: "Treasurer", handicapExact: "22", account:"member"});

db.account.insert({username:"tonylyons", name: "Tony Lyons", password: "tonylyons", email: "", phone: "", committee: "true", position: "Handicap Chairman", handicapExact: "12.3", account:"member"});

db.account.insert({username:"craighulton", name: "Craig Hulton", password: "craighulton", email: "", phone: "", committee: "true", position: "Capitan", handicapExact: "19.4", account:"member"});

db.account.insert({username:"paulcraneybarnie", name: "Paul Craney Barnie", password: "paulcraneybarnie", email: "paulbarniedecor@sol.com", phone: "07402958921", committee: "true", position: "Handicap Secratary", handicapExact: "8", account:"member"});

db.account.insert({username:"stephenpercy", name: "Stephen Percy", password: "stephenpercy", email: "steve.percy@nxp.com", phone: "07910751885", committee: "false", position: "", handicapExact: "18.3", admin: "true", account:"member"});

db.account.insert({username:"admin", name: "Stephen Percy", password: "123", admin: "true", account:"admin"});


db.event.remove();

db.event.insert({name: "August Society Day", course: "Dukinfield Golf Club", postcode: "SK165GF", website: "http://www.dukinfieldgolfclub.co.uk/", price: "15", included: "golf", maxplayers: "20", firstteatime: "09:30", day: "7", month: "8", year: "2017", organiser: "Stephen Percy", notes: "" });

db.event.insert({name: "1st game of the year", course: "North Manchester", postcode: "", website: "", price: "18.50", included: "bacon butty and coffee", maxplayers: "0", firstteatime: "09:30", day: "04", month: "03", year: "2016", organiser: "Gary Norton", notes: "" });

db.event.insert({name: "Player of the year game 2", course: "Cavendish GC", postcode: "", website: "", price: "19", included: "golf", maxplayers: "20", firstteatime: "11:00", day: "28", month: "04", year: "2016", organiser: "Paul Craney Barnie", notes: "come along and play one of the best courses in our area for a reasonable price, £10 deposit to secure place unfortunately on this occasion full payment needs to be paid by Monday 18th April, 20 places available,cheers guys . Paul C.B" });

db.event.insert({name: "Marple", course: "Marple", postcode: "", website: "", price: "16.50", included: "golf, fish and chips", maxplayers: "24", firstteatime: "09:00", day: "23", month: "05", year: "2016", organiser: "Graham Stafford", notes: "" });

db.event.insert({name: "Cavendish - the return", course: "Cavendish", postcode: "", website: "", price: "18", included: "golf", maxplayers: "16", firstteatime: "08:10", day: "13", month: "09", year: "2016", organiser: "John Hart", notes: "Back to Cavendish for our half price game after April's game there was hit with snow! Only 16 places so names down quick." });

db.event.insert({name: "STAMFORD", course: "Stamford G.C", postcode: "", website: "", price: "15", included: "golf", maxplayers: "16", firstteatime: "09:45", day: "05", month: "10", year: "2016", organiser: "John Hart", notes: "" });
*/
//db.event.insert({})

//functions to validate data using database

let isValidPassword = function(data, cb){       // check is password and username match any database record 
    db.account.find({username:data.username, password:data.password}, function(err, res){ 
        if(res.length > 0){ 
            cb(true); 
        } else{ 
            cb(false); 
        } 
    }); 
} 
 
let isUserAdmin = function(data, cb){           // check is user an Admin
    db.account.find({username:data.username, admin: "true"}, function(err, res){ 
        if(res.length > 0){ 
            cb(true); 
        } else{ 
            cb(false); 
        } 
    }); 
} 

function isUsernameTaken(user, cb){         // check is username alrady exists in database
    if(db.account.find({username:user}, function(err, res){
        if(res.length>0){
            cb(true);
        } else{
            cb(false);  
        }    
    }));  
}

// create server

var app = express();
var server = require('http').Server(app);

app.use(express.static('public'));

var listener = server.listen(process.env.PORT || 2000, function(){ 
    console.log("Listening on port", listener.address().port); 
}); 

// handle connection between server and clients

const SOCKET_LIST = {};

let io = require('socket.io')(server,{}); 

io.sockets.on('connection', function(socket){   // runs if client connected to the server   
    console.log("Socket connection"); 
    
    socket.id = Math.random();                  // client to receive unique ID  
    SOCKET_LIST[socket.id] = socket; 

    socket.on('dataRequest', function(data){    // data was requested from client
        switch(data){
            case "committee":
                db.account.find({committee: "true"}, function(err, res){
                    socket.emit('committeeData',res);   // sent committe data to client
                });
                break; 
            case "membershiplisting":
                db.account.find({account: "member"}, function(err, res){
                    socket.emit('membershiplistingData',res);   // sent all members data to client
                });
                break;
            case "societyeventslisting":
                db.event.find({}, function(err, res){
                    socket.emit('societyeventslistingData',res);   // sent all members data to client
                });
                break;
                
        }
    });
    
    //requests from addmember panel 
    
    socket.on('addMember', function(data){      // member data was sent with request to add member to database 
        isUsernameTaken(data["username"], function(res){
            if(res){
                socket.emit('usernametaken',{});    // username is already taken, member not added   
            } else{
                data["account"] = "member";
                db.account.insert(data);            // add member to database
                socket.emit('memberAdded',data);    // sent response to client
            }
        });
    });

    //requests from editmember panel    
    
    socket.on('editMember', function(data){     // member data was sent to update existing member
         db.account.update({username: data.username},{$set:{name: data.name, handicapExact: data.handicapExact}});  // update name and handicap
         socket.emit('memberEdited',data);  // sent response to client with the same data
     });
    
    socket.on('deleteMember', function(data){   // request to delete specific username was sent
        db.account.remove({username: data.username}); 
        socket.emit('memberDeleted',data);  // sent response to client
    });     

    //requests from account settings panel   
    
    socket.on('checkCurrentPassword', function(data){   // simmilar to validatePassword funct but on request, used to check current password when user wants to change it 
        isValidPassword(data, function(res){
            if(res){ 
                socket.emit('passwordCorrect',data);
            } else{
                socket.emit('passwordIncorrect',data);
            }
        });
    }); 
    
    socket.on('changePassword', function(data){     // request to change password of specific user was sent
        db.account.update({username: data.username},{$set:{password: data.password}});
        socket.emit('passwordChanged',data);    // sent response to client
    });

    socket.on('changeUserDetails', function(data){  // request to change details of user which is logged in was sent
        if(data.oldusername === data.username){     // check if username not changed
            db.account.update({username: data.oldusername},{$set:{username: data.username, name: data.name, email: data.email, phone: data.phone}});    // if not update member data
            socket.emit('userDetailsChanged',data);
        } else{
            isUsernameTaken(data.username, function(res){   // check if username taken
            if(res){
                socket.emit('usernametaken',{});   
            } else{
                db.account.update({username: data.oldusername},{$set:{username: data.username, name: data.name}});      // if not allow to change username and rest of the data
                socket.emit('userDetailsChanged',data);
            }});
        }
    });    
        
    // Request to log in
    
    socket.on('signIn', function(data){     // client sent data to log in
        isValidPassword(data, function(res){  // check if username and password correct
            if(res){ 
                isUserAdmin(data, function(res2){   // check if user an admin
                    if(res2){
                        socket.emit('signInResponse',{success: true, username: data["username"], admin: "true"});   // if admin sent response to client that user has admin rights
                    } else{
                        socket.emit('signInResponse',{success: true, username: data["username"], admin: "false"});  // if not admin sent response to client that user has no admin rights
                    }
                }); 
            } else{ 
                socket.emit('signInResponse',{success: false});  // if password and username not correct sent approperiate response to client
            } 
        }); 
    });
});
