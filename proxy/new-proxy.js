var http = require('http'),
    cors_headers = {
      'Access-Control-Allow-Origin'  : '*',
      'Access-Control-Allow-Methods' : 'POST, GET, PUT, DELETE, OPTIONS',
      'Access-Control-Max-Age'       : '86400', // 24 hours
      'Access-Control-Allow-Headers' : 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization'
    },
    httpProxy = require('http-proxy'),
    url  = require('url');;

httpProxy.createServer(function (req, res, proxy) {
    
    var url_parts = url.parse(req.url, true),
        target_url = decodeURIComponent(url_parts.query.url),
        host = url.parse(target_url,true).host,
        path = url.parse(target_url,true).path;

    if (url_parts.query.url === undefined) {
        console.log("returning -> 404");
        return res.writeHead(404, {});
    }

    console.log("================ New request ================");
    console.log(" target_url:     ", url_parts.query.url, " ? ", target_url);
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
        var headers = proxy_response.headers;
        for (name in cors_headers) {
            headers[name] = cors_headers[name];
        }        
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
