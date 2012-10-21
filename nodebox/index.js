
var http = require('http'),
    store = require('nodebox/store'),
    serials = require('nodebox/serialise'),
    models = require('js/models.js'),
    _ = require('underscore'),
    url = require("url"),
	u = require('js/utils.js'),
	log = require('nlogger').logger(module);


var Server = Backbone.Model.extend(
	{
		handlers : {
			'GET': '_get',
			'PUT': '_put',
			'OPTIONS': '_options',
		},
		defaults: {
			port : 8888
		},
		initialize:function() {
			var this_ = this;
			http.createServer(function() { return this_._dispatchRequest.apply(this_, arguments); }).listen(this.attributes.port);
			log.info("Server has started on " + this.attributes.port);			
		},
		_get_store : function() {
			var d = u.deferred(), s = new ns.Store();
			s.connect().then(function() { d.resolve(s); });
			return d;
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
			request.on('end', function () {
				d.resolve(body.join(''));
			});			
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
		_get : function(request, response) {
			var this_ = this;
			this._get_store().then(function(store) {
				var query = url.parse(request.url).query,
					uri = decodeURIComponent(query.id),
					graph = query.g && models.get_graph(decodeURIComponent(query.g)) || models.DEFAULT_GRAPH,
					s = serialize(graph.get_or_create(uri));
				response.writeHead(200, {"Content-Type": "text/json"});
				response.write(JSON.stringify(s));
				response.end();
			}).fail(function() { this_.err_response(response, 500, "cant connect to database"); });
		},
		_put:  function(request, response) {
			var this_ = this;
			this._get_store().then(function(store) {
				this_.get_large_body(request).then(function(body) {
					var query = url.parse(request.url).query,
						graph = query.g && models.get_graph(decodeURIComponent(query.g)) || models.DEFAULT_GRAPH,
						D = u.deferred();
					try {
						var dataload = JSON.parse(body);
						if (!$.isArray(dataload)) {	return this_.err_response(response, 409, "json set must be an array of models"); }
						var load_ds = u.range(dataload.length).map(function() { return u.deferred(); });
						_(dataload).map(function(mjson, i) {
							try {
								var um = serials.deserialize(mjson, graph);
								store.write(um).then(function(writeid) { load_ds[i].resolve({id: um.id, version:writeid}); });
								return um;
							} catch(eunpack) {	log.warn('Error with received json:', mjson._id, eunpack.details, mjson );	}
						});
						u.when(load_ds).then(function(writeids) { D.resolve(writeids); });
					} catch(e) { return this_.err_response(response, 409, "error unpacking json");
					D.then(function(writeids) {
						response.writeHead(200, {"Content-Type": "text/json"});
						response.write(JSON.strinigfy(writeids));  
						return response.end();					
					}).fail(function(err) {
						err_response(response, err.code, err.details);
					});
				});
			}).fail(function() { this_.err_response(response, 500, "can't connect to database"); });
		},
		_options:function(request,response) {
			response.end();
		},
		
	}
};

if (require.main === module) {
	log.info("Starting nodebox ");
	(new Server())
}
