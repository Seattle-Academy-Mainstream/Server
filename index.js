//sets up includes
var express = require('express')
var http = require('http');
var app = express();
var fs = require('fs');
var settings = require('./settings.json');

//these are the globals
var Posts = [];

var mysql = require('mysql');

//table names
//posts, upvotes
var Database = mysql.createConnection({
  host     : settings.host,
  user     : settings.user,
  password : settings.password, 
  database : "mainstream"
});

PostsTable.connect();

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

function SQL_AddPost(DataObject, Callback)
{
  //add the data to mysql
    PostsTable.query('INSERT INTO posts SET ?', DataObject, function(err, result) 
    {
      Callback();
    });
}

function SQL_ToJSON()
{
  var Posts = [];

    connection.query('SELECT * FROM posts', function(err, results) 
    {
      for (var i = 0; i < results.length; i++)
      {
        connection.query('SELECT * FROM upvotes WHERE id = ?', results[i]["ID"], function(err, results) {

        });
      }
    });

  return Posts;
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
  socket.on('update', function (data)
  {
    //add parse the JSON string
    var DataObject = JSON.parse(data);

    //need to get rid of the data object because it belongs in a different table
    var Upvotes = JSON.parse(JSON.stringify(DataObject["Upvotes"]));
    delete DataObject["Upvotes"];

    SQL_AddPost(DataObject, function()
    {
      //send most recent update out to client
      io.sockets.emit('update', JSON.stringify(DataObject));
    });
  });

  //on update connection
  socket.on('upvote', function (data)
  {
    //parse it
    var DataObject = JSON.parse(data);

    var PostIndex = IndexFromID(DataObject["ID"]);

    //if the upvote already exists, remove it
    if(Posts[PostIndex]["Upvotes"].indexOf(DataObject["User"]) >= 0)
    {
      console.log("Removing Upvote")
      Posts[PostIndex]["Upvotes"].pop(Posts[PostIndex]["Upvotes"].indexOf(DataObject["User"]));
    }

    //if it doesn't exits, add it
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