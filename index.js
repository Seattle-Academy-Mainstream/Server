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
    Callback(JSON.parse(body)["email"]);
  });
}

function CurrentSQLTime()
{
  var date = new Date();
  date = date.getUTCFullYear() + '-' +
      ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
      ('00' + date.getUTCDate()).slice(-2) + ' ' + 
      ('00' + date.getUTCHours()).slice(-2) + ':' + 
      ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
      ('00' + date.getUTCSeconds()).slice(-2);
  console.log(date);
  return date;
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
  //the initial request
  socket.on('update', function (data)
  {
    //write the data
    console.log("A User Asked for all the Data.");

    //send all data to client
    SQL.ToJSON(function(data)
    {
      console.log(JSON.stringify(data));
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

  socket.on('deleteall', function ()
  {
    SQL.DeleteAll(function(Post)
    {

    });
  });

  //on update connection
  //this function can change anything about a post except upvotes
  socket.on('addpost', function (data, callback)
  {
    //add parse the JSON string
    var DataObject = JSON.parse(data);

    //set the time
    DataObject["Timestamp"] = CurrentSQLTime();

    console.log(JSON.stringify(DataObject));
 
    TokenToUsername(DataObject["Author"], function(Data)
    {
      DataObject["Author"] = Data;

      console.log(Data);

      //if the token is expired and these was no author
      if(DataObject.hasOwnProperty("Author") == 0)
      {
        callback("NoToken");
      }

      if(DataObject["Author"].indexOf("@seattleacademy.org") != -1)
      {
        SQL.AddPost(DataObject, function(Post)
        {
          console.log("A user added a post.");
        });
      }
      else
      {
        console.log("Invalid Username.");
      }
    });
  });

  //on update connection
  socket.on('upvote', function (data)
  {
    //parse it
    var DataObject = JSON.parse(data);

    TokenToUsername(DataObject["User"], function(Data)
    {
      DataObject["User"] = Data;

      if(DataObject["User"].indexOf("@seattleacademy.org") != -1)
      {
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
      }
      else
      {
        console.log("Invalid Username.");
      }
    });
  });
});

