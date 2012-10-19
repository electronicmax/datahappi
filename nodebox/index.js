
var http = require('http'),
    models = require('js/models.js'),
    _ = require('underscore'),
    url = require("url"),
	u = require('js/utils.js'),
	log = require('nlogger').logger(module);


// response functions
var add_cors = function(response) {
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'POST,GET,DELETE,PUT,OPTIONS');
	response.setHeader('Access-Control-Allow-Headers', 'Content-Type');			
	return response;
};
var err_response = function(response, code, text) {
	response.writeHead(code, {"Content-Type": "text/json"});
	response.write(JSON.stringify({text:text, code:code}));
	response.end();	
};

// core serialisation / deserialisation
var deserialize = function(json) {
	if (_.isUndefined(json._id)) {
		throw new Exception({ error: 'unpacking json', details: 'model must have an _id attr' });
	}
	var graph = models.DEFAULT_GRAPH;
	if (json._graph) {
		graph = models.get_graph(json._graph);
	}
	var model = graph.get_or_create(json._id);
	delete json._id;
	delete json._graph;
	model.clear({silent:true});
	model.set(json);
	model.trigger('change');
	return model;
}, serialize = function(model) {
	var _sm_model = function(m) {
		return { _id : m.id, _graph: m.graph && m.graph.id || undefined };
	};
	var _sm_literal = function(v) { return v; };
	var _sm_value = function(v) {
		if (v instanceof Backbone.Model) { return _sm_model(v); }
		return _sm_literal(v);
	};
	return u.zip(model.keys().map(function(k) {
		var varr = model.get(k);
		return [k, varr.map(_sm_value)];
	}));
};

// response handlers
var handlers = {
	'GET' :  function(request, response) {
		var query = url.parse(request.url).query;
		var uri = query.id, graph = query.g && models.get_graph(query.g) || models.DEFAULT_GRAPH;
		var s = serialize(graph.get_or_create(uri));
		response.writeHead(200, {"Content-Type": "text/json"});
		response.write(JSON.stringify(s));
		response.end();
	},
	'PUT' :  function(request, response) {
		var query = url.parse(request.url).query;
		var graph = query.g;
		if (_.isUndefined(graph)) { graph = models.DEFAULT_GRAPH.id; }		
		var body = [];
		request.on('data', function (data) { body.push(data.toString()); });
        request.on('end', function () {
			body = body.join('');
			var D = u.deferred();
			try {
				var dataload = JSON.parse(body);
				if (!$.isArray(dataload)) {
					return err_response(response, 409, "json set must be an array of models");
				}
				var load_ds = u.range(dataload.length).map(function() { return u.deferred(); });
				var models = _(dataload).map(function(mjson, i) {
					try {
						console.log('unpacking ', mjson._id);
						var um = deserialize(mjson);
						um.save().then(function() {
							console.log('committing to disk -- ', um && um.attributes);
							load_ds[i].resolve(um);
						});
						return um;
					} catch(eunpack) {
						logging.warn('error unpacking json ', eunpack.details, mjson );
					}
				});
				u.when(load_ds).then(function(x) { D.resolve(models); });
			} catch(e) {
				return err_response(response, 409, "error unpacking json");
			}
			D.then(function(x) {
				response.writeHead(200, {"Content-Type": "text/plain"});
				response.write("done.");  
				return response.end();									
			}).fail(function(err) {
				err_response(response, err.code, err.details);
			});
		});
	},
	'POST' :  function(request, response) {
		response.writeHead(200, {"Content-Type": "text/plain"});
		var body = '';
		request.on('data', function (data) {  body += data;   });
        request.on('end', function () { console.log('body ' +  body); console.log('--'); });
		response.write("POST");
		response.end();		
	},
	'OPTIONS': function(request,response) {
		response.write("Server: NodeJS");
		response.end();
	}
};
function onRequest(request, response) {
	if (handlers[request.method]) {
		return handlers[request.method](request,add_cors(response));
	}
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.write("Dunno how to handle " + request.method);
    response.end();
}

http.createServer(onRequest).listen(8888);
console.log("Server has started.");
