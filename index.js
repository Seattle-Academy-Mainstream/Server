#! /usr/bin/node

//sets up includes
var express = require('express')
var http = require('http');
var app = express();
var fs = require('fs');
var settings = require('./settings.json');
var SQL = require('./SQL.js');
var Cropper = require('./cropper.js');
var fs = require('fs');
var request = require('request');

//program header that sets up the pid
//fs.writeFile('/run/mainstream.pid', process.pid, { mode: 0644 },
//  function(err) 
//  {
//    if (err) throw err;
//  }
//);

//process.setgid('mainstreamd');
//process.setuid('mainstreamd');

function TokenToUsername(Token, Callback)
{
  request("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + Token, function(error, response, body) 
  {
    console.log(response);
    console.log(body);
    Callback(response["email"]);
  });
}


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
  TokenToUsername("eyJhbGciOiJSUzI1NiIsImtpZCI6Ijc1OGJlMzY5ZjJhNzM5YjQ2ODcxZmMxOGY3ZmQ3ODMxMjcyZDQ4NWMifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXRfaGFzaCI6IlJPbW8zU1plQ1luN2FzVGoydEJqcUEiLCJhdWQiOiI1MzMzMzIzODA5MjEtN204ZW9pNDk2OGt2bDFtbXIwa2szY2xjbzI1bG9lbWcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDY0Njg1NDMwMTQ1ODg1NTQyNzUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXpwIjoiNTMzMzMyMzgwOTIxLTdtOGVvaTQ5NjhrdmwxbW1yMGtrM2NsY28yNWxvZW1nLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiaGQiOiJzZWF0dGxlYWNhZGVteS5vcmciLCJlbWFpbCI6ImlzYWFjemluZGFAc2VhdHRsZWFjYWRlbXkub3JnIiwiaWF0IjoxNDQwNzI0MTY5LCJleHAiOjE0NDA3Mjc3NjksIm5hbWUiOiJJc2FhYyBaaW5kYSIsImdpdmVuX25hbWUiOiJJc2FhYyIsImZhbWlseV9uYW1lIjoiWmluZGEiLCJsb2NhbGUiOiJlbiJ9.raXoS1nGtI_RDz7--tQZjIA5V0F_xns-kMKZm5Cm0EV0bx9JgoYQjhveT1BMz3u3T0obJT8Io_zyrLsHKwLu_gHnYJbYMkXI51kFKMU_iendIZZt60G-ul_Vb2WQDh4-sH-W6MiD9-6gJrmTZICftiUm0oEJ629N0qNMYHXLsTBpkJ8hs0irm_CZKMGj3dQFMNcbUBBXzOo2lvHS9GXXsqX0aGggWGIQO8rlt34Y5R1IFKRJ8MIV3YGyY7lVFAVl2-GuD7GefzVy0m8bgI_gOjT3pmjFDSD-jBOPHwp8TT8uZ9WdH4KCRm-IX2OEv1jtrzlNMHSYu8oIHJT82VpxFg", function(Data){
    console.log(Data);
  });
  
  //the initial request
  socket.on('update', function (data)
  {
    //write the data
    console.log("A User Asked for all the Data.");

    //send all data to client
    SQL.ToJSON(function(data)
    {
      socket.emit('update', JSON.stringify(data));
    });
  });

  //when an image is recieved, write it to disk
  socket.on('image', function (data, callback)
  {
    callback();

    var ParsedData = JSON.parse(data);

    var buffer = new Buffer(ParsedData["Data"], 'base64');

    console.log("Recieved Image with Length " + buffer.length);

    fs.writeFile("/var/local/mainstreamd/RawImages/" + ParsedData["Name"], buffer, function(err) {
      console.log(err);

      Cropper.Crop(ParsedData["CroppingData"], ParsedData["Name"], function()
      {

      });
    });
  });

  //on update connection
  //this function can change anything about a post except upvotes
  socket.on('addpost', function (data, callback)
  {
    callback();

    //add parse the JSON string
    var DataObject = JSON.parse(data);

    SQL.AddPost(DataObject, function(Post)
    {
      console.log("A user added a post.");
      //SQL.PostToJSON(DataObject["ID"], function(Post)
      //{
        //send most recent update out to client
        //io.sockets.emit('update', JSON.stringify(Post));
      //});
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
      console.log("A User Voted on Something.");
      //update the users

      SQL.ToJSON(function(data)
      {
        socket.emit('updateupvotes', JSON.stringify(data));
      });
    });
  });
});

