var http = require('http'),
    httpProxy = require('http-proxy'),
    url  = require('url');;

httpProxy.createServer(function (req, res, proxy) {
    var url_parts = url.parse(req.url, true),
        host = url_parts.query.host || "localhost",
        path = url_parts.pathname;

    console.log("================ New request ================");
    console.log(" HOST:     ", host);
    console.log(" PATH NAME:", path);
    console.log(" HEADERS:\n", req.headers);
    
    var proxy = http.createClient(80, host);

    // we want to bring the new host over into the headers
    req.headers.host = host;
    
    var proxy_request = proxy.request(req.method, path, req.headers);
    proxy_request.addListener('response', function (proxy_response) {
        proxy_response.addListener('data', function(chunk) {
            res.write(chunk, 'binary');
        });
        proxy_response.addListener('end', function() {
            res.end();
        });        
        res.writeHead(proxy_response.statusCode, proxy_response.headers);
    });
    req.addListener('data', function(chunk) {
        proxy_request.write(chunk, 'binary');
    });
    req.addListener('end', function() {
        proxy_request.end();
    });
    
    /*
      // abbreviated way >
      req.headers['accept'] = 'application/xhtml+xml,text/html';
      req.headers.host = host;
      return proxy.proxyRequest(req, res, {
         host: host,
         port: 80
      });
    */

}).listen(9292);
