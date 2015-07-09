#!/usr/bin/node

//sets up includes
var http = require('http');
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
        connection.query('SELECT * FROM upvotes WHERE id = ?', results[i]["ID"], function(err, UpvoteUsers) {
          results[i]["Upvotes"] = UpvoteUsers;
        });
      }
    });

  return Posts;
}

SQL_AddPost({"Category": "Sports", "Content": "Hello World", "Author": "me@isaaczinda.com", "ID": "0123456789"});
JSON.parse(SQL_ToJSON());