var http = require('http'),
    httpProxy = require('http-proxy'),
    url  = require('url');

httpProxy.createServer(function (req, res, proxy) {
    var header, value,
        url_parts = url.parse(req.url, true),
        host = url_parts.query.host || "localhost",
        port = url_parts.query.port || 80,
        path = url_parts.pathname,
        cors_headers = {
            'access-control-allow-methods': 'HEAD, POST, GET, PUT, PATCH, DELETE',
            'access-control-max-age': '86400',
            'access-control-allow-headers': 'accept, accept-charset, accept-encoding, accept-language, authorization, content-length, content-type, host, origin, proxy-connection, referer, user-agent, x-requested-with',
            'access-control-allow-credentials': 'true',
            'access-control-allow-origin': req.headers.origin
        };

    for (header in req.headers) {
        cors_headers['access-control-allow-headers'] += ", " + header;
    }
    console.log(cors_headers['access-control-allow-headers'])

    console.log("================ New request ================");
    console.log(" HOST:     ", host);
    console.log(" PATH NAME:", path);
    console.log(" HEADERS:\n", req.headers);

    for (header in cors_headers) {
        value = cors_headers[header];
        res.setHeader(header, value);
    }

    // we want to bring the new host over into the headers
    req.headers.host = host;

    return proxy.proxyRequest(req, res, {
        host: host,
        port: port
    });

}).listen(9292);
