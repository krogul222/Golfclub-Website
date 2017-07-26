var express = require('express');

var app = express();

app.use(express.static('public'));

var listener = app.listen(process.env.PORT || 3000, function(){
  console.log('listening on', listener.address().port);
});