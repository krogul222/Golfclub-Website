var mongojs = require('mongojs');
var express = require('express');
var db = mongojs('mongodb://golf:nexperia@ds123193.mlab.com:23193/nexperiagolfsociety', ['account', 'event','competition']);
//var db = mongojs('localhost:27017/golf', ['account','event','competition']);      // connect to database

//db.account.remove();
/*
db.account.insert({username:"johnhart", name: "John Hart", password: "johnhart", email: "johnymike@hotmail.com", phone: "07930980836", committea: "true", position: "President", handicapExact: "14.2", account:"member", admin: "true", id:"1"});

db.account.insert({username:"garynorton", name: "Gary Norton", password: "garynorton", email: "", phone: "", committea: "true", position: "Treasurer", handicapExact: "22", account:"member", id:"2"});

db.account.insert({username:"tonylyons", name: "Tony Lyons", password: "tonylyons", email: "", phone: "", committea: "true", position: "Handicap Chairman", handicapExact: "12.3", account:"member", id:"3"});

db.account.insert({username:"craighulton", name: "Craig Hulton", password: "craighulton", email: "", phone: "", committea: "true", position: "Capitan", handicapExact: "19.4", account:"member", id:"4"});

db.account.insert({username:"paulcraneybarnie", name: "Paul Craney Barnie", password: "paulcraneybarnie", email: "paulbarniedecor@sol.com", phone: "07402958921", committea: "true", position: "Handicap Secratary", handicapExact: "8", account:"member", id:"5"});

db.account.insert({username:"stephenpercy", name: "Stephen Percy", password: "stephenpercy", email: "steve.percy@nxp.com", phone: "07910751885", committea: "false", position: "", handicapExact: "18.3", admin: "true", account:"member", id:"6"});

db.account.insert({username:"admin", name: "Krzysztof Krogulski", password: "123", admin: "true", account:"admin"});
*/

//db.event.remove();
/*
db.event.insert({name: "August Society Day", course: "Dukinfield Golf Club", postcode: "SK165GF", website: "http://www.dukinfieldgolfclub.co.uk/", price: "15", included: "golf", maxplayers: "20", firstteatime: "09:30", day: "07", month: "08", year: "2017", organiser: "Stephen Percy", notes: "" , id: "1"});

db.event.insert({name: "1st game of the year", course: "North Manchester", postcode: "", website: "", price: "18.50", included: "bacon butty and coffee", maxplayers: "0", firstteatime: "09:30", day: "04", month: "03", year: "2016", organiser: "Gary Norton", notes: "", id: "2" });

db.event.insert({name: "Player of the year game 2", course: "Cavendish GC", postcode: "", website: "", price: "19", included: "golf", maxplayers: "20", firstteatime: "11:00", day: "28", month: "04", year: "2016", organiser: "Paul Craney Barnie", notes: "come along and play one of the best courses in our area for a reasonable price, £10 deposit to secure place unfortunately on this occasion full payment needs to be paid by Monday 18th April, 20 places available,cheers guys . Paul C.B", id: "3" });

db.event.insert({name: "Marple", course: "Marple", postcode: "", website: "", price: "16.50", included: "golf, fish and chips", maxplayers: "24", firstteatime: "09:00", day: "23", month: "05", year: "2016", organiser: "Graham Stafford", notes: "", id: "4" });

db.event.insert({name: "Cavendish - the return", course: "Cavendish", postcode: "", website: "", price: "18", included: "golf", maxplayers: "16", firstteatime: "08:10", day: "13", month: "09", year: "2016", organiser: "John Hart", notes: "Back to Cavendish for our half price game after April's game there was hit with snow! Only 16 places so names down quick.", id: "5" });

db.event.insert({name: "STAMFORD", course: "Stamford G.C", postcode: "", website: "", price: "15", included: "golf", maxplayers: "16", firstteatime: "09:45", day: "05", month: "10", year: "2016", organiser: "John Hart", notes: "", id: "6" });
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
            case "committea":
                db.account.find({committea: "true"}, function(err, res){
                    socket.emit('committeaData',res);   // sent committe data to client
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
            case "competitionresultslisting":
                db.competition.find({}, function(err, res){
                    socket.emit('competitionresultslistingData',res);   // sent all members data to client
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
                data["id"] = Math.floor(Math.random()*1000000000000);    
                db.account.insert(data);            // add member to database
                socket.emit('memberAdded',data);    // sent response to client
            }
        });
    });
    
    
    socket.on('addCompetitionResult', function(data){     
        
                let id = Math.floor(Math.random()*1000000000000);        
                data["id"] = id;
        
                for(let i = 0, length = data["results"].length; i < length; i++){
                    data["results"][i]["eventname"] = data["eventname"];
                    data["results"][i]["competitionname"] = data["competitionname"];
                    data["results"][i]["venue"] = data["venue"];
                    data["results"][i]["year"] = data["year"];
                    data["results"][i]["month"] = data["month"];
                    data["results"][i]["day"] = data["day"];
                    data["results"][i]["id"] = data["id"];
                    data["results"][i]["notes"] = data["notes"];
                    console.log("Mamber "+data["results"][i]["member"]);
                    db.competition.insert(data["results"][i]); 
                }
                socket.emit('competitionResultAdded',data);    // sent response to client
    });
   
    socket.on('addSingleMemberCompetitionResult', function(data){
        db.competition.insert(data); 
        socket.emit('singleMemberCompetitionResultAdded',data);
    });
    
    //requests from addsociety panel     
    
    socket.on('addSocietyEvent', function(data){     
        
                let id = Math.floor(Math.random()*1000000000000);        
                data["id"] = id;
                db.event.insert(data);            // add event to database
                socket.emit('eventAdded',data);    // sent response to client
    });

    socket.on('editSocietyEvent', function(data){     
         db.event.update({id: data.id},{$set:{name: data.name, course: data.course, postcode: data.postcode, website: data.website, price: data.price, included: data.included, maxplayers: data.maxplayers, firstteatime: data.firstteatime, day: data.day, month: data.month, year: data.year, organiser: data.organiser, notes: data.notes}});  
         socket.emit('eventEdited',data);  // sent response to client with the same data
     });    
    
    socket.on('deleteavent', function(data){   // request to delete specific event was sent
        console.log("delete Event");
        db.event.remove({id: data.id}); 
        socket.emit('eventDeleted',data);  // sent response to client
    });     
    
    socket.on('editCompetition', function(data){     
         db.competition.update({id: data.id},{$set:{eventname: data.eventname, competitionname: data.competitionname, venue: data.venue, day: data.day, month: data.month, year: data.year, notes: data.notes}}, { "multi" : true });  
         socket.emit('competitionEdited',data);  // sent response to client with the same data
     });        
    
    socket.on('deleteCompetition', function(data){   // request to delete specific competition was sent
        console.log("delete Competition");
        db.competition.remove({id: data.id}, { "multi" : true }); 
        socket.emit('competitionDeleted',data);  // sent response to client
    });     
    
    socket.on('editMemberCompetitionResult', function(data){     // member data was sent to update existing member
         db.competition.update({id: data.id, member: data.member},{$set:{handicap: data.handicap, netscore: data.netscore}});  // update netscore and handicap
         console.log(data["member"]["name"]);
         socket.emit('memberCompetitionResultEdited',data);  // sent response to client with the same data
     });    

    socket.on('deleteMemberCompetitionResult', function(data){   // request to delete specific username was sent
        db.competition.remove({id: data.id, member: data.member}); 
        console.log(data["member"]["name"]);
        socket.emit('memberCompetitionResultDeleted',data);  // sent response to client
    });     
    

    socket.on('addCommitteeMember', function(data){
         db.account.update({username: data.username}, {$set:{position: data.position, committee: "true"}});
         socket.emit('committeeMemberAdded', data);
     });
    
     socket.on('editCommitteeMember', function(data){
         db.account.update({username: data.username}, {$set:{position: data.position}});
         socket.emit('committeeMemberEdited', data);
     });
    
     socket.on('deleteCommitteeMember', function(data){
         db.account.update({username: data.username}, {$set:{committee: false}});
         
         socket.emit('committeeMemberDeleted', data);
     });    
    
    //requests from editmember panel    
    
    socket.on('editMember', function(data){     // member data was sent to update existing member
         if(data.oldname !== data.name){
             let newMember = data.member;
             newMember.name = data.name;
             
             db.competition.update({"member.name": data.oldname}, {$set:{"member.name": data.name}}, { "multi" : true }, function( err, result ) {
                    if ( err ) throw err;
             });
         }
         
         db.account.update({username: data.username},{$set:{name: data.name, handicapExact: data.handicapExact}});  // update name and handicap
         socket.emit('memberEdited',data);  // sent response to client with the same data
     });
    
    socket.on('deleteMember', function(data){   // request to delete specific username was sent
        db.account.remove({username: data.username}); 
        db.competition.remove({"member.name": data.name}); 
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
            
            if(data.oldname !== data.name){
                db.competition.update({"member.name": data.oldname}, {$set:{"member.name": data.name}}, { "multi" : true }, function( err, result ) {
                    if ( err ) throw err;
                });
                
              /*  db.competition.find({}, function(err, res){
                    socket.emit('competitionresultslistingData',res);   // sent all members data to client
                }); 
                
                db.account.find({account: "member"}, function(err, res){
                    socket.emit('membershiplistingData',res);   // sent all members data to client
                });*/
            }
            socket.emit('userDetailsChanged',data);
        } else{
            isUsernameTaken(data.username, function(res){   // check if username taken
            if(res){
                socket.emit('usernametaken',{});   
            } else{
                db.account.update({username: data.oldusername},{$set:{username: data.username, name: data.name}});      // if not allow to change username and rest of the data
                
                if(data.oldname !== data.name){
                    db.competition.update({"member.name": data.oldname}, {$set:{"member.name": data.name}}, { "multi" : true }, function( err, result ) {
                        if ( err ) throw err;
                    });
                    
                /*    db.competition.find({}, function(err, res){
                        socket.emit('competitionresultslistingData',res);   // sent all members data to client
                    }); 
                    
                    db.account.find({account: "member"}, function(err, res){
                        socket.emit('membershiplistingData',res);   // sent all members data to client
                    });*/
                }
                    
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
