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

    req.headers['accept'] = 'application/xhtml+xml,text/html';

    return proxy.proxyRequest(req, res, {
        host: host,
        port: 80
    });

}).listen(9292);
