
var pg = require('pg'),
    Backbone = require('backbone'),
    $ = require('jquery'),
    _ = require('underscore'),
    sql = require('nodebox/store-sql.js'),
    m = require('js/models.js'),
    u = require('js/utils.js'),
    log = require('nlogger').logger(module);

var get_model = function(data) { return new Backbone.Model(data); };

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
	create_tables:function() {
		var this_ = this;
		var dfds = [u.deferred(), u.deferred()];
		if (this._connection){
			_([sql.CREATE.OBJ_TABLE, sql.CREATE.PROPS_TABLE]).map(function(table,i) {
				log.info('creating table ', table);
				var d = dfds[i];
				this_._connection.query(table, function(error, rows) {
					if (error === null) {	return d.resolve();} 
					return d.reject();
				});
			});
		}
		return u.when(dfds);
	},
	_merge_in:function(model, new_json) {
		// now diff things in ---------
		var enter_keys = _(_(new_json).keys()).difference(model.keys()).map(function(k) {
			model.set(k,new_json[k])
		});
		var same_keys = _(_(new_json).keys()).intersection(model.keys()).map(function(k) {
			model.set(k,new_json[k])
		});
		var exit_keys = _(model.keys()).difference(_(new_json).keys()).map(function(k) {
			model.unset(k);
		});
		return model;
	},
	read:function(mod) {
		if (typeof(mod) == 'string') {	mod = m.DEFAULT_GRAPH.get_or_create(mod);	};
		console.log('asking about ', mod.id, mod.graph.id);
		var this_ = this;
		var d = u.deferred();
		this.raw_read(mod.id, mod.graph)
			.then(function(json) {
				d.resolve(json !== undefined ? this_._merge_in(mod, json) : undefined);
			})
			.fail(function(err) { d.reject(err, mod); });
		return d;
	},
	raw_read:function(uri, graph) {
		var d = u.deferred();
		if (!u.defined(graph)) { graph = m.DEFAULT_GRAPH; }
		var unpack_row = function(l) {
			var converters = ({
				"number": function(v) { return [v.property, v.value_index, parseInt(v.literal_value)]; },
				"string": function(v) { return [v.property, v.value_index, v.literal_value]; },
				"date_long": function(v) { return [v.property, v.value_index, new Date(parseInt(v.literal_value))]; }
			});
			if (l.literal_type && converters[l.literal_type]) {
				return converters[l.literal_type](l);
			}
			if (l.object_ref) {
				return [ l.property, l.value_index, graph.get_or_create(l.object_ref) ];
			}
		};
		var assemble = function(rows) {
			if (rows.length === 0) { return undefined; }
			var obj = {};
			rows.map(function(r) {
				var k = r[0], vidx = r[1], val = r[2];
				if (!obj[k]) { obj[k] = []; }
				obj[k][vidx] = val;
			});
			return obj;
		};
		console.log('uri >> ', uri, ' graph >> ', graph.id, sql.READ.SELECT_URI);		
		this._connection.query(
			sql.READ.SELECT_URI, [uri, graph.id],
			function(err, result) {
				console.log('result.rows', err || result.rows);
				var unpacked = result.rows.map(function(r) { return unpack_row(r); })
				log.debug('unpacked obj ', unpacked);
				var obj = assemble(unpacked);
				log.debug('raw_read() :: read obj ', obj);
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
				if (u.defined(err)) { return rowd.reject(err); }  rowd.resolve();
			};
			if (val instanceof m.Maxel) {
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
		this_._connection.query('BEGIN', function(err,result) {
			this_._connection.query(sql.WRITE.OBJECT,
				[model.id, model.graph.id, model.version, deleted === true],
				function(err, result) {
					if (!u.defined(err) && result.rows.length > 0) {
						var writeid = result.rows[0].writeid;
						var dfds = model.keys().map(function(k) {
							var vals = model.get(k);
							return _(vals).map(function(v, i) {  return to_row(writeid, k, v, i);  });
						});
						u.when(dfds).then(function() {
							this_._connection.query('COMMIT;', function(err2, result) {
								console.log("commit ran, ", err2);
								if (!u.defined(err2)) { return d.resolve();   }
								d.reject('fail at final commit, err2');
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
		this.read(model.id).then(function(m) {
			if (m === undefined || m.version == model.version) {
				console.log(' can actually save -- ');
				// then we can actually save
				this_._low_level_write(model)
					.then(function() { d.resolve(model); })
					.fail(function() { d.reject.apply(d,arguments); });
			} else {
				d.reject({
					type:"Obsolete",
					object:model,
					updated_object:m,
					message:"The version of this model is obsolete on the server; please merge before writing"
				});
			}
		});
		// need to update our copy ---
		return d;
	},	
	// test:function() {
	// 	this._connection.query("SELECT NOW() as when", function(err, result) {
	// 		log.debug("Row count: %d",result.rows.length);  // 1
	// 		log.debug("Current year: %d", result.rows[0].when.getYear());
	// 	});
	// },
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
