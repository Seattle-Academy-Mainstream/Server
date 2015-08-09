var SQL = require("./SQL.js");  

SQL.PostToJSON("0123456789", function(data)
{
	console.log(JSON.stringify(data));
});

