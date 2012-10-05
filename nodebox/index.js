
var http = require('http'),
    _ = require('underscore'),
    url = require("url"); 

var add_cors = function(response) {
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'POST,GET,DELETE,PUT,OPTIONS');
	response.setHeader('Access-Control-Allow-Headers', 'Content-Type');			
	return response;
};
var handlers = {
	'GET' :  function(request, response) {
		var pathname = url.parse(request.url).pathname;
		response.setHeader('Access-Control-Allow-Origin', '*');						
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.write("GET for " + pathname + '\n');
		response.end();		
	},
	'PUT' :  function(request, response) {
		response.setHeader('Access-Control-Allow-Origin', '*');						
		response.writeHead(200, {"Content-Type": "text/plain"});
		console.log('request PUT >> ', request.body);
		var body = '';
		request.on('data', function (data) {  body += data;   });
        request.on('end', function () { console.log('body ' +  body); console.log('--'); });
		response.write("PUT");
		response.end();		
	},
	'POST' :  function(request, response) {
		response.writeHead(200, {"Content-Type": "text/plain"});
		console.log('request POST >> ', request.body);
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
