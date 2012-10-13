
var pg = require('pg'),
    Backbone = require('backbone'),
    $ = require('jquery'),
    _ = require('underscore'),
    u = require('../js/utils.js');

var OBJ_TABLE = "create table if not exists nodebox_objs( " +
      "writeid serial primary key, " + 
      "uri varchar(2048) NOT NULL, " + 
      "type varchar(2048), " + 
      "graph varchar(2048) DEFAULT '/', " +
      "version integer DEFAULT 0," +
	  "deleted boolean DEFAULT false" +
"); ";

var PROPS_TABLE = "create table if not exists nodebox_props ( " +
    "properties_of integer REFERENCES nodebox_objs (writeid) NOT NULL, " +
    "property varchar(2048) NOT NULL, " + 
    " value_index int DEFAULT 0, " + 
    " literal_value text, " + 
    " literal_type varchar(255) DEFAULT '', " + 
    " object_ref varchar(2048), " + 
    " object_ref_version integer DEFAULT 0," + 
    " PRIMARY KEY (properties_of, property, value_index) " + 
" ); ";

var READ_JOIN = "select * from nodebox_props, (select nodebox_objs.writeid, nodebox_objs.uri from nodebox_objs, (select uri,max(version) as highest_version from nodebox_objs group by uri) as maxver where nodebox_objs.uri=maxver.uri AND nodebox_objs.version=maxver.highest_version) as latest where nodebox_props.properties_of=latest.writeid;";

var READ_JOIN_URI = "select * from nodebox_props, (select nodebox_objs.writeid, nodebox_objs.uri from nodebox_objs, (select uri,max(version) as highest_version from nodebox_objs where uri=$1 group by uri) as maxver where nodebox_objs.uri=maxver.uri AND nodebox_objs.version=maxver.highest_version) as latest where nodebox_props.properties_of=latest.writeid;";

var get_model = function(data) { return new Backbone.Model(data); };
var Store = Backbone.Model.extend({
	defaults : { db_url:process.env.WEBBOX_DB || "tcp://nodebox:nodebox@localhost/nodebox" },
	connect: function(options) {
		var this_ = this;
		var d = u.deferred();
		options = _(this.defaults).chain().clone().extend(options ? options : {}).value();
		pg.connect(options.db_url, function(err, client) {
			console.log('connected to ', options.db_url);
			this_.trigger('connected', client);
			this_._connection = client;
			d.resolve(this_);
			this_.test();
		});
		return d;
	},
	create_tables:function() {
		var this_ = this;
		var dfds = [ u.deferred(), u.deferred() ];
		if (this._connection){
			_([OBJ_TABLE, PROPS_TABLE]).map(function(table,i) {
				console.log('creating table ', table);
				var d = dfds[i];
				this_._connection.query(table, function(error, rows) {
					if (error === null) {	return d.resolve();} 
					return d.reject();
				});
			});
		}
		return u.when(dfds);
	},
	read:function(uri) {
		var d = u.deferred();		
		this._connection.query(
			READ_JOIN_URI, [uri],
			function(err, result) {
				console.log("result rows ", err, result);
				d.resolve( result.rows.length ? get_model(result.rows[0]) : undefined );
			});
		return d;
	},
	compute_diffs:function(version_1, version_2) {
		var query = "SELECT * from things where URI is $1 AND version=$2 ORDER by version DESC LIMIT 1;"
		var ds = [ deferred(), deferred() ];
		var D = deferred();
		var this_ = this;
		jQ.each([version_1, version_2]).each(
			function(ith) {
				var version = this.valueOf();
				this_._connection.query(query, [uri, version], function(err, result) {
					ds[ith].resolve( result.rows.length ? result.rows[0] : undefined );
				});
			});

		u.when(ds).then(function(values) {});
		
		// this._connection.query(, [uri, version_1],
		// 	function(err, result) {
		// 		ds[0].resolve( result.rows.length ? result.rows[0] : undefined );
		// 	});
		// this._connection.query(, [uri, version_1],
		// 	function(err, result) {
		// 		ds[0].resolve( result.rows.length ? result.rows[0] : undefined );
		// 	});		
		
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

exports.Store = Store;
