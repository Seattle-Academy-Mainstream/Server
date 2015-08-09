#! /usr/bin/node

//sets up includes
var express = require('express')
var http = require('http');
var app = express();
var fs = require('fs');
var settings = require('./settings.json');
var SQL = require('./SQL.js');
var fs = require('fs');

//program header that sets up the pid
//fs.writeFile('/run/mainstream.pid', process.pid, { mode: 0644 },
//  function(err) 
//  {
//    if (err) throw err;
//  }
//);

//process.setgid('mainstreamd');
//process.setuid('mainstreamd');


//sets up the express.js server
app.use(express.static("/var/local/mainstreamd/"));
var server = app.listen(10000);

//sets up socket.io with the express server
var io = require('socket.io').listen(server);

//reduce the log level
io.set('log level', 1);


//once the connection is established
io.sockets.on('connection', function (socket) 
{
  //the initial request
  socket.on('initial', function (data)
  {
    //write the data
    console.log("A User Asked for all the Data.");

    //send all data to client
    SQL.ToJSON(function(data)
    {
      socket.emit('initial', JSON.stringify(data));
    });
  });

  //when an image is recieved, write it to disk
  socket.on('image', function (data)
  {
    var ParsedData = JSON.parse(data);

    var buffer = new Buffer(ParsedData["Data"], 'base64');

    console.log("Recieved Image with Length " + buffer.length);

    fs.open("/var/local/mainstreamd/Images/" + ParsedData["Name"], 'w+', function(err, fd)
    {
      fs.write(fd, buffer, 0, buffer.length, 0, function(err) {});
    });
  });

  //on update connection
  //this function can change anything about a post except upvotes
  socket.on('update', function (data)
  {
    //add parse the JSON string
    var DataObject = JSON.parse(data);

    SQL.AddPost(DataObject, function(Post)
    {
      SQL.PostToJSON(DataObject["ID"], function(Post)
      {
        //send most recent update out to client
        io.sockets.emit('update', JSON.stringify(Post));
      });
    });
  });

  //on update connection
  socket.on('upvote', function (data)
  {
    //parse it
    var DataObject = JSON.parse(data);

    SQL.ToggleUpvote(DataObject["ID"], DataObject["User"], function()
    {
      //add data to array
      console.log("A User Voted on Something; Sending Out Updates to all Users.");
      //update the users
      SQL.PostToJSON(DataObject["ID"], function(Post)
      {
        //send most recent update out to client
        io.sockets.emit('update', JSON.stringify(Post));
      });
    });
  });
});
