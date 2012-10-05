
var pg = require('pg'),
    Backbone = require('backbone'),
    jQ = require('jquery'),
    _ = require('underscore');
    models = require('../js/models');

//or native libpq bindings
//var pg = require('pg').native

var deferred = function() { return new jQ.Deferred(); };
var get_model = function() { };

var Store = Backbone.Model.extend({
	defaults : { db_url:process.env.WEBBOX_DB || "tcp://nodebox:nodebox@localhost/nodebox" },
	connect: function() {
		var this_ = this;
		var d = deferred();
		pg.connect(conString, function(err, client) {
			this_.trigger('connected', client);
			this_._connection = client;
			d.resolve(this_);
			this_.test();
		});
		return d;
	},
	read:function(uri) {
		var d = deferred();
		this._connection.query("SELECT * from things where URI is $1 ORDER by version DESC LIMIT 1;", [uri],
			function(err, result) {	d.resolve( result.rows.length ? get_model(result.rows[0]) : undefined );});
		return d;
	},
	compute_diffs:function(version_1, version_2) {
		var query = "SELECT * from things where URI is $1 AND version=$2 ORDER by version DESC LIMIT 1;"
		this._connection.query(, [uri, version_1],
			function(err, result) {
				d.resolve( result.rows.length ? get_model(result.rows[0]) : undefined );
			});
		
	},
	write:function(model) {
		this.read(model.id).then(function(m) {
			if (m === undefined || model.__version__ == model.__version__) {
				// then we can actually save
				
			} else {
				throw {
					type:"Obsolete",
					object:model,
					updated_object:m,
					message:"The version of this model is obsolete on the server; please merge before writing"
				};
			}
		});
		// need to update our copy ---
		return false;
	},	
	test:function() {
		this._connection.query("SELECT NOW() as when", function(err, result) {
			console.log("Row count: %d",result.rows.length);  // 1
			console.log("Current year: %d", result.rows[0].when.getYear());
		});
	}	
});

exports = {
	Store:Store
};
