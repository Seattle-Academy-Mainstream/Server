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
fs.writeFile('/run/mainstream.pid', process.pid, { mode: 0644 },
 function(err)
 {
   if (err) throw err;
 }
);

process.setgid('mainstreamd');
process.setuid('mainstreamd');

function TokenToUsername(Token, Callback)
{
  request("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + Token, function(error, response, body) 
  {
    var Data = JSON.parse(body);

    if(Data.hasOwnProperty("error_description"))
    {
      Callback("", "NoToken");
    }
    else
    { 
      Callback(Data["email"], null);
    }
  });
}

function CurrentSQLTime()
{
  var currentdate = new Date(); 
  var Month = currentdate.getMonth() + 1;
  var Day = currentdate.getDate();
  var Year = currentdate.getFullYear();

  console.log(currentdate.toString());

  //this lists the miliseconds of time, which makes comparison easy
  var Milliseconds = (new Date).getTime();

  return Year + "-" + Month + "-" + Day + "-" + Milliseconds;
}


//sets up the express.js server
app.use(express.static("/var/local/mainstreamd/"));
var server = app.listen(10000);

//sets up socket.io with the express server
var io = require('socket.io').listen(server);

//reduce the log level
io.set('log level', 1);

function CompareObjects(a,b) 
{
  var atimestamp = a["Timestamp"].split("-")[3];
  var btimestamp = b["Timestamp"].split("-")[3];


  if (atimestamp < btimestamp)
    return 1;
  if (atimestamp > btimestamp)
    return -1;
  return 0;
}

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
      //we sort the list so that the newest items are first
      data.sort(CompareObjects);

      //only includes the most recent 25 posts
      var Recent = data.slice(0, 25);

      socket.emit('update', JSON.stringify(Recent));
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

  socket.on('checktoken', function (data, callback)
  {
    TokenToUsername(data, function(Author, Error)
    {
      callback(Error);
    });
  })

  //on update connection
  //this function can change anything about a post except upvotes
  socket.on('addpost', function (data, callback)
  {
    //add parse the JSON string
    var DataObject = JSON.parse(data);

    //set the time
    //this is the format 2015-08-31 01:40:45
    DataObject["Timestamp"] = CurrentSQLTime();

    console.log(JSON.stringify(DataObject));
 
    TokenToUsername(DataObject["Author"], function(Data, Error)
    {
      DataObject["Author"] = Data;

      //if the token is expired and these was an error
      if(Error != null)
      {
        console.log("The token was not valid.")
        callback("NoToken");
      }
      //if the author actually exists
      else
      {
        callback();

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
      }
    });
  });

  //on update connection
  socket.on('upvote', function (data, callback)
  {
    //parse it
    var DataObject = JSON.parse(data);

    TokenToUsername(DataObject["User"], function(Data, Error)
    {
      DataObject["User"] = Data;

      //if the token is expired and these was an error
      if(Error != null)
      {
        console.log("The token was not valid.")
        callback("NoToken");
      }
      //if the author actually exists
      else
      {
        callback();

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
      }
    });
  });
});

