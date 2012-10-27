
var http = require('http'),
	Backbone = require('backbone'),
    store = require('nodebox/store'),
    serials = require('js/serialise'),
    models = require('js/models.js'),
    _ = require('underscore'),
    $ = require('jquery'),
    url = require("url"),
	u = require('js/utils.js'),
    io = require('socket.io'),
    querystr = require('querystring'),
	log = require('nlogger').logger(module);

var Server = Backbone.Model.extend({
	handlers : {
		'GET': '_get',
		'PUT': '_put',
		'OPTIONS': '_options'
	},
	defaults: {
		port : 8888
	},
	initialize:function() {
		var this_ = this;
		log.info(" STARTING ON PORT : ", this.attributes.port );
		this._get_store().then(function(s) {
			s.create_tables().then(function(x) {
				log.info('tables created or verified - ready to go ');
				var server = http.createServer(function() {
					return this_._dispatchRequest.apply(this_, arguments);
				}).listen(this_.attributes.port);
				this_._set_up_socketio(server,s);
			});
		});
	},
	_set_up_socketio:function(httpserver, stor) {

		var ios = io.listen(httpserver).on('connection', function(socket) {
			// console.log('got a connection ', socket, socket.id);
			// hang on to it!
		});
		ios.set('transports',['websocket']);
			
		// now ask our store to tell us about connections
		// setInterval(function() { ios.sockets.emit("allo", { data: 123 }); }, 1000);
		var this_ = this;
		stor.start_trigger_listener().on('new-object-write', function(x) {
			var fields = x.split(','), version = parseInt(fields[0],10), id = fields[1], graph=fields[2];
			ios.sockets.emit('new-object-write', JSON.stringify({ version: version, id : id, graph: graph }));
		});
	},
	_get_store : function() {
		var d = u.deferred(), s = new store.Store();
		s.connect().then(function() { d.resolve(s); });
		return d.promise();
	},			
	add_cors : function(response) {
		response.setHeader('Access-Control-Allow-Origin', '*');
		response.setHeader('Access-Control-Allow-Methods', 'POST,GET,DELETE,PUT,OPTIONS');
		response.setHeader('Access-Control-Allow-Headers', 'Content-Type');			
		return response;
	},
	err_response : function(response, code, text) {
		response.writeHead(code, {"Content-Type": "text/json"});
		response.write(JSON.stringify({text:text, code:code}));
		response.end();	
	},
	get_large_body : function(request) {
		var d = u.deferred();
		var body = [];
		request.on('data', function (data) { body.push(data.toString()); });
		request.on('end', function () { d.resolve(body.join(''))	});			
		return d.promise();
	},
	// handlers
	_dispatchRequest: function(request, response) {
		var this_ = this;
		if (this.handlers[request.method]) {
			return this[this.handlers[request.method]](request,this_.add_cors(response));
		}
		var pathname = url.parse(request.url).pathname;
		log.info("Request for " + pathname + " received.");
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("Dunno how to handle " + request.method);
		response.end();
	},
	_list_objs : function(s, response, graph_url) {
		s.list_undeleted_objs_in_graph(graph_url).then(function(x) {
			console.log(' x is ', x);			
			s = JSON.stringify(x);
			response.writeHead(200, {"Content-Type": "text/json"});
			response.write(JSON.stringify(s));
			response.end();
		});
	},
	_list_graphs : function(s, response) {
		s.list_graphs().then(function(x) {
			response.writeHead(200, {"Content-Type": "text/json"});
			console.log(' x is ', x);
			response.write(JSON.stringify(x));
			response.end();
		});
	},	
	_get_single_obj : function(s, response, model) {
		console.log('get single object ', model.id);
		s.read(model).then(function(x) {
			console.log(" x >> ", x);
			if (!u.defined(x)) {
				s = "{}";
			} else {
				s = serials.serialize(x);
			}
			response.writeHead(200, {"Content-Type": "text/json"});
			response.write(JSON.stringify(s));
			response.end();
		}).fail(function(err) {
			response.writeHead(500, {"Content-Type": "text/plain"});
			response.write(err.toString());
			response.end();
		});
	},
	_get : function(request, response) {
		var this_ = this;		
		this._get_store().then(function(store) {
			console.log('GOT STORE ');
			var requrl = url.parse(request.url),
			    command = requrl.pathname.split('/')[1],
			    query = querystr.parse(requrl.query || ''),
				uri = decodeURIComponent(query.id),
				graph = query.g && models.get_graph(decodeURIComponent(query.g)) || models.DEFAULT_GRAPH;
			
			switch (command) {
				case 'get' : return this_._get_single_obj(store, response, graph.create(uri));
				case 'list' : return this_._list_objs(store, response, graph);
				case 'graphs' : return this_._list_graphs(store, response);				
			}
			
			return this_.err_response(response, 404, "command not found : " + command);
			
		}).fail(function() { this_.err_response(response, 500, "cant connect to database"); });
	},
	_put:  function(request, response) {
		var this_ = this;
		var body_d = this.get_large_body(request);
		var store_d = this._get_store();
		console.log('__PUT -- GETTING STORE ');			
		$.when(body_d,store_d).then(function(body, store) {
			console.log(' got body >> ', body, typeof(body));
			var query = querystr.parse(url.parse(request.url).query),
			graph = query.g && models.get_graph(decodeURIComponent(query.g)) || models.DEFAULT_GRAPH,
			D = u.deferred();
			try {
				var dataload = JSON.parse(body);
				if (!_.isArray(dataload)) {	return this_.err_response(response, 409, "json set must be an array of models"); }
				var load_ds = u.range(dataload.length).map(function() { return u.deferred(); });
				_(dataload).map(function(mjson, i) {
					try {
						var um = serials.deserialize(mjson, graph);
						console.log('writing ', mjson, typeof(mjson), um.id, _(um.attributes).keys().length);						
						store.write(um).then(function(writeid) { load_ds[i].resolve({id: um.id, version:writeid}); })
							.fail(function(error) { load_ds[i].reject({id: um.id, error:error }); });
					} catch(eunpack) {
						log.warn('Error with received json:', eunpack, mjson._id, eunpack.details, mjson );
					}
				});
				u.when(load_ds).then(function(writeids) { D.resolve(writeids); });
			}catch(e) { return this_.err_response(response, 409, "error unpacking json"); }

			D.then(function(writeids) {
				response.writeHead(200, {"Content-Type": "text/json"});
				response.write(JSON.stringify(writeids));  
				response.end();
			}).fail(function(err) {
				this_.err_response(response, err.code, err.details);
			});
		}).fail(function() { this_.err_response(response, 500, "can't connect to database"); });			
	},
	_options:function(request,response) {
		response.end();
	}
});


if (require.main === module) { (new Server()); }
