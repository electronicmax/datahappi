
var pg = require('pg'),
	Backbone = require('backbone'),
	$ = require('jquery'),
	_ = require('underscore'),
	sql = require('nodebox/store-sql.js'),
	models = require('js/models.js'),
	u = require('js/utils.js'),
	log = require('nlogger').logger(module);

var Store = Backbone.Model.extend({
	defaults : { db_url:process.env.WEBBOX_DB || "tcp://nodebox:nodebox@localhost/nodebox" },
	connect: function(options) {
		var this_ = this;
		var d = u.deferred();
		options = _(this.defaults).chain().clone().extend(options ? options : {}).value();
		pg.connect(options.db_url, function(err, client) {
			log.info('connected to ', options.db_url);
			this_.trigger('connected', client);
			this_._connection = client;
			d.resolve(this_);
		});
		return d;
	},
	start_trigger_listener:function() {
		var connstr = this.attributes.db_url;
		console.log('connstr ', connstr);
		var client = new pg.Client(connstr);
		var this_ = this;		
		client.connect();
		console.log("connnnnnnnnnnnnnected");
		client.query('LISTEN "change_nodebox_objs"');
		client.on('notification', function(data) {
			this_.trigger('new-object-write', data.payload);
		});
		return this;
	},
	create_tables:function() {
		var this_ = this;
		var commands = [sql.CREATE.OBJ_TABLE, sql.CREATE.PROPS_TABLE, sql.CREATE.NOTIFY_TRIGGER, sql.CREATE.TRIGGER];
		var D = u.deferred();
		var check_tables = u.deferred();
		var dfds = u.range(commands.length).map(function() { return u.deferred(); });		
		if (this._connection ){
			this_._connection.query(sql.GET_TABLES_NAMED, ['nodebox_objs'],	function(err, results) {
				if (err) {
					console.log("ERROR couldn't check for tables ", err);
					return check_tables.reject(err); 
				}
				if (results.rows.length === 0) {
					check_tables.resolve(false);					
					console.log('tables dont exist. making them'); 
					_(commands).map(function(table,i) {
						log.info('running SQL ', table);
						var d = dfds[i];
						this_._connection.query(table, function(error, rows) {							
							if (error === null) { return d.resolve(); }
							console.log("error! ", error);
							return d.reject();
						});
					});
				} else {
					check_tables.resolve(true);
				}
			});
		}
		check_tables.then(function(tables_exist) {
			if (tables_exist) { return D.resolve(); }
			u.when(dfds).then(D.resolve).fail(D.reject);
		});
		return D.promise();
	},
	_merge_in:function(model, new_json) {
		model.clear();
		model.set(new_json);
		/*
		// now diff things in ---------
		var enter_keys = _(_(new_json).keys()).difference(model.keys()).map(function(k) {
			model.set(k,new_json[k]);
		});
		var same_keys = _(_(new_json).keys()).intersection(model.keys()).map(function(k) {
			model.set(k,new_json[k]);
		});
		var exit_keys = _(model.keys()).difference(_(new_json).keys()).map(function(k) {
			model.unset(k);
		});
		*/
		return model;
	},
	list_undeleted_objs_in_graph:function(graph_uri) {
		var d = u.deferred();		
		if (graph_uri instanceof Backbone.Model) { graph_uri = graph_uri.id; }
		this._connection.query(sql.READ.GET_UNDELETED_OBJS_IN_GRAPH, [graph_uri], function(err,results) {
			if (err) { return d.reject(err); }
			d.resolve( results.rows.map(function(r) { return r.uri }) );
		});
		return d;
	},
	list_graphs:function() {
		var d = u.deferred();
		this._connection.query(sql.READ.GET_GRAPHS, function(err,results) {
			if (err) { return d.reject(err); }
			d.resolve( results.rows.map(function(r) { return r.graph }) );
		});
		return d;
	},
	read:function(mod) {
		if (typeof(mod) == 'string') {	mod = models.DEFAULT_GRAPH.get_or_create(mod);	}
		var this_ = this;
		var d = u.deferred();
		this.raw_read(mod.id, mod.graph)
			.then(function(json) {
				// json will be undefined if we don't ahve the object
				return d.resolve(json !== undefined ? this_._merge_in(mod, json) : undefined);
			}).fail(function(err) { d.reject(err, mod); });
		return d;
	},
	raw_read:function(uri, graph) {
		var d = u.deferred();
		if (!u.defined(graph)) { graph = models.DEFAULT_GRAPH; }
		var unpack_row = function(l) {
			var converters = ({
				"number": function(v) { return [v.property, v.value_index, parseInt(v.literal_value, 10)]; },
				"string": function(v) { return [v.property, v.value_index, v.literal_value]; },
				"date": function(v) { return [v.property, v.value_index, new Date(parseInt(v.literal_value, 10))]; }
			});
			if (l.literal_type && converters[l.literal_type]) {
				return converters[l.literal_type](l);
			}
			if (l.object_ref) {
				return [ l.property, l.value_index, graph.get_or_create(l.object_ref) ];
			}			
		};
		var assemble = function(rows) {
			console.log('assmble > ', rows);
			if (rows.length === 0) { return undefined; }
			var obj = {};
			rows.map(function(r) {
				var k = r[0], vidx = r[1], val = r[2];
				if (!obj[k]) { obj[k] = []; }
				obj[k][vidx] = val;
			});
			return obj;
		};
		this._connection.query(
			sql.READ.SELECT_URI, [uri, graph.id],
			function(err, result) {
				if (err) { console.log("error > ", err); return d.reject(err); }
				var unpacked = result.rows.map(function(r) { return unpack_row(r); })
				var obj = assemble(unpacked);
				d.resolve(obj);
			});
		return d;
	},
	_low_level_write:function(model, deleted) {
		// first we have to write the object write
		var this_ = this;
		var d = u.deferred();
		var to_row = function(property_of, property, val, index) {
			var rowd = u.deferred();
			var callback = 	function(err, response) {
				if (u.defined(err)) { return rowd.reject(err); }
				rowd.resolve();
			};
			if (val instanceof models.Maxel) {
				console.log(' val is a model, so writing property object ');
				this_._connection.query(sql.WRITE.PROPERTY_OBJECT, [property_of, property, index, val.id], callback);
			} else {
				// literal TODO make more complete
				var ltype = 'string';
				if (_.isDate(val)) { ltype = "date"; }
				if (typeof(val) == 'number') { ltype = 'number'; }
				var lval = val.valueOf().toString();
				this_._connection.query(sql.WRITE.PROPERTY_LITERAL,[property_of, property, index, ltype, lval], callback);
			}
			return rowd;
		};
		console.log('model >>>>>> comments', model.id, model.attributes); 
		this_._connection.query('BEGIN', function(err,result) {
			this_._connection.query(sql.WRITE.OBJECT,
				[model.id, model.graph.id, model.version, deleted === true],
				function(err, result) {
					if (!u.defined(err) && result.rows.length > 0) {
						var writeid = result.rows[0].writeid;
						var dfds = _(model.attributes).keys().map(function(k) {
							var vals = model.get(k);
							return _(vals).map(function(v, i) {  return to_row(writeid, k, v, i);  });
						});
						u.when(dfds).then(function() {
							this_._connection.query('COMMIT;', function(err2, result) {
								if (!u.defined(err2)) { return d.resolve(writeid);  }
								d.reject('fail at final commit', err2);
							});
						}).fail(function(err) { d.reject('fail at statement', err); });
					} else {
						console.log('error committing object write', err);
						this_._connection.query('ROLLBACK;', function(err2,result) {  d.reject(err);   });
					}
				});
		});
		return d.promise();
	},
	write:function(model) {
		var d = u.deferred();
		var this_ = this;
		console.log('write being called with model ', model.id, model.graph.id);
		this.read(model).then(function(_m) {
			if (_m === undefined || _m.version == model.version) {
				// then we can actually save
				this_._low_level_write(model)
					.then(function(write_id) { d.resolve(write_id); })
					.fail(function() { d.reject.apply(d,arguments); });
			} else {
				d.reject({
					type:"Obsolete",
					object:model,
					updated_object:_m,
					message:"The version of this model is obsolete on the server; please merge before writing"
				});
			}
		});
		// need to update our copy ---
		return d;
	},	
	test:function() {
		this._connection.query("SELECT NOW() as when", function(err, result) {
			log.debug("Row count: %d",result.rows.length);  // 1
			log.debug("Current year: %d", result.rows[0].when.getYear());
		});
	},
	compute_diffs:function(uri, version_1, version_2) {
		var query = "SELECT * from things where URI is $1 AND version=$2 ORDER by version DESC LIMIT 1;"
		var ds = [ u.deferred(), u.deferred() ];
		var D = u.deferred();
		var this_ = this;
		_([version_1, version_2]).map(
			function(v, ith) {
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
	list_objects:function(graph, include_deleted) {
		var d = u.deferred();
		var command = sql.READ.GET_UNDELETED_OBJS_IN_GRAPH;
		if (graph && !include_deleted) {
			command = sql.READ.GET_OBJS_IN_GRAPH;
		} else if (!graph && include_deleted) {
			command = sql.READ.GET_ALL_OBJS;
		} else if (!graph && !include_deleted) {
			command = sql.READ.GET_ALL_UNDELETED_OBJS;
		}
		this._connection.query(command, graph ? [graph] : [],
							   function(err, result) {
								   if (err) { return d.fail(err); }
								   d.resolve(result.rows.map(function(x) { return x.uri; }));
							   });
		return d;
	}
});

exports.Store = Store;
