//sets up includes
var http = require('http');
var fs = require('fs');
var settings = require('./settings.json');
var mysql = require('mysql');

//setup the database
var Database = mysql.createConnection({
  host     : settings.host,
  user     : settings.user,
  password : settings.password, 
  database : "mainstream"
});

Database.connect();

function AddPost(DataObject, Callback)
{
  //add the data to mysql
  Database.query('INSERT INTO posts SET ?', DataObject, function(err, result) 
  {
    if(err)
    {
      console.log(err);
    }
    Callback();
  });
}

function ToggleUpvote(ID, Username, Callback)
{
  var UpvoteArray = [];


  Database.query('SELECT * FROM upvotes WHERE id = ?', ID, function(err, UpvoteUsers) 
  {
    for(var p = 0; p < UpvoteUsers.length; p++)
    {
      UpvoteArray.push(UpvoteUsers[p]["Author"]);
    }

    console.log(UpvoteArray);
    if(UpvoteArray.indexOf(Username) == -1)
    {
      Database.query('INSERT INTO upvotes SET ?', {"ID": ID, "Author": Username}, function(err, result)
      {
        if(err)
        {
          console.log(err);
        }
        Callback();
      });
    }
    else
    {
      Database.query('DELETE FROM upvotes WHERE Author = ?', Username, function (err, result) {
        Callback();
      });	
    }
  });
}

function ClearUpvotes(ID, Callback)
{
  Database.query('DELETE FROM upvotes WHERE ID = ?', ID, function (err, result) 
  {
    Callback();
  }); 
}

function PostToJSON(ID, Callback)
{
  Database.query('SELECT * FROM posts WHERE id = ?', ID, function(err, Post) 
  {

    Database.query('SELECT * FROM upvotes WHERE id = ?', ID, function(err, UpvoteUsers) 
    {
      //store all of users who upvotes in the upvote array
      var UpvoteArray = [];
      for(var p = 0; p < UpvoteUsers.length; p++)
      {
        UpvoteArray.push(UpvoteUsers[p]["Author"]);
      }          

      Post["Upvotes"] = UpvoteArray;
      Callback(Post);
      });
    });
  });
}

function ToJSON(Callback)
{
  Database.query('SELECT * FROM posts', function(err, results) 
  {
   console.log(results);
   var timesrun = 0;
   results.forEach(function(i)
   {
    Database.query('SELECT * FROM upvotes WHERE id = ?', i["ID"], function(err, UpvoteUsers) {
     var UpvoteArray = [];
     for(var p = 0; p < UpvoteUsers.length; p++)
     {
      UpvoteArray.push(UpvoteUsers[p]["Author"]);
    }          

    i["Upvotes"] = UpvoteArray;
    timesrun += 1;
    if(timesrun == results.length)
    {
      console.log(timesrun);
      console.log(results);
      Callback(results);
    }
  });
  });
 });
}



