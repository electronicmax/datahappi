
var pg = require('pg'),
    Backbone = require('backbone'),
    _ = require('underscore');

//or native libpq bindings
//var pg = require('pg').native

var conString = process.env.WEBBOX_POSTGRES_DB || "tcp://electronic:1234@localhost/electronic";
console.log('connecting to database ', conString);

//error handling omitted
pg.connect(conString, function(err, client) {
	console.log('err, ', err, 'client ', client);
	client.query("SELECT NOW() as when", function(err, result) {
		console.log("Row count: %d",result.rows.length);  // 1
		console.log("Current year: %d", result.rows[0].when.getYear());
	});
});



