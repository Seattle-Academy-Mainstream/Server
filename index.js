//sets up includes
var express = require('express')
var http = require('http');
var app = express();
var fs = require('fs');

//these are the globals
var Posts = [];

//sets up the express.js server
app.use(express.static("/var/local/mainstreamd/"));
var server = app.listen(10000);

//sets up socket.io with the express server
var io = require('socket.io').listen(server);

//reduce the log level
io.set('log level', 1);

function IndexFromID(ID)
{
  for (var i = 0; i < Posts.length; i++)
  {
    if(ID == Posts[i]["ID"])
    {
      return i;
    }
  }
  return -1;
}

//once the connection is established
io.sockets.on('connection', function (socket) 
{
  //the initial request
  socket.on('initial', function (data)
  {
    //write the data
    console.log("A User Asked for all the Data.");

    //send most recent update out to client
    socket.emit('initial', JSON.stringify(Posts));
  });

  socket.on('image', function (data)
  {
    var ParsedData = JSON.parse(data);

    var buffer = new Buffer(ParsedData["Data"], 'base64');

    console.log(ParsedData["Name"]);

    console.log("Recieved Image with Length " + buffer.length);

    fs.open("/var/local/mainstreamd/Images/" + ParsedData["Name"], 'w+', function(err, fd)
    {
      fs.write(fd, buffer, 0, buffer.length, 0, function(err) {});
    });
  });

  //on update connection
  socket.on('update', function (data)
  {
    //add data to array
    var DataObject = JSON.parse(data);
    Posts.push(DataObject);

    //send most recent update out to client
    io.sockets.emit('update', JSON.stringify(DataObject));

    console.log("A User updated the Data; Sending Out Updates to all Users.");
  });

  //on update connection
  socket.on('upvote', function (data)
  {
    //parse it
    var DataObject = JSON.parse(data);

    var PostIndex = IndexFromID(DataObject["ID"]);

    if(Posts[PostIndex]["Upvotes"].indexOf(DataObject["User"]) >= 0)
    {
      console.log("Removing Upvote")
      Posts[PostIndex]["Upvotes"].pop(Posts[PostIndex]["Upvotes"].indexOf(DataObject["User"]));
    }
    else
    {
      console.log("Adding Upvote")
      Posts[PostIndex]["Upvotes"].push(DataObject["User"]);
    }

    //update the users
    io.sockets.emit('update', JSON.stringify(Posts[PostIndex]));

    //add data to array
    console.log("A User Voted on Something; Sending Out Updates to all Users.");
  });
});