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

Database.connect();

function SQL_AddPost(DataObject, Callback)
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

function SQL_AddUpvote(ID, Username, Callback)
{
	var UpvoteArray = [];


	Database.query('SELECT * FROM upvotes WHERE id = ?', ID, function(err, UpvoteUsers) {
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

function SQL_ToJSON(Callback)
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
SQL_AddUpvote("0123456789", "i@saa.c", function()
{
SQL_AddPost({"Image": "test.png", "Category": "Sports", "Content": "Hello World 2", "Author": "me@isaaczinda.com", "ID": "012346789"}, function()
{
	SQL_ToJSON(function(data)
	{
		console.log(data);
		console.log(JSON.stringify(data));
	});
});
});
