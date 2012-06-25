var http = require('http'),
    httpProxy = require('http-proxy'),
    url  = require('url');;

httpProxy.createServer(function (req, res, proxy) {
    var url_parts = url.parse(req.url, true),
        query = url_parts.query,
        r = query.url.split(/\//),
        host = r.shift(),
        port = host.split(':')[1] || 80,
        path = "/" + r.join('/');

    console.log(r, host, path, port)

    req.url = path;
    req.headers['accept'] = 'application/xhtml+xml,text/html';

    return proxy.proxyRequest(req, res, {
      host: host,
      port: port
    });

}).listen(9292);

var proxyServerO = function(req, res, proxy) {
  var cors_headers, header, headers, host, ignore, key, path, port, value, _i, _len, _ref, _ref1, _ref2;
  var url = req.url.substr(1);
  // TODO: URL validation here
  console.log("URL:", url)

  /*if (!req.headers.origin) {
    console.log('req.headers.origin not given');
    res.write('hello https\n');
    res.end();
    return;
  }*/
  if (req.headers['access-control-request-headers']) {
    headers = req.headers['access-control-request-headers'];
  } else {
    headers = 'accept, accept-charset, accept-encoding, accept-language, authorization, content-length, content-type, host, origin, proxy-connection, referer, user-agent, x-requested-with';
    _ref = req.headers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      header = _ref[_i];
      if (req.indexOf('x-') === 0) {
        headers += ", " + header;
      }
    }
  }
  cors_headers = {
    'access-control-allow-methods': 'HEAD, POST, GET, PUT, PATCH, DELETE',
    'access-control-max-age': '86400',
    'access-control-allow-headers': headers,
    'access-control-allow-credentials': 'true',
    'access-control-allow-origin': req.headers.origin
  };
  if (req.method === 'OPTIONS') {
    console.log('responding to OPTIONS request');
    res.writeHead(200, cors_headers);
    return res.end();
  } else {
    _ref1 = req.url.match(/\/([^\/]+)(.*)/), ignore = _ref1[0], host = _ref1[1], path = _ref1[2];
    _ref2 = host.split(/:/), host = _ref2[0], port = _ref2[1] || 80;

    console.log("proxying to " + host + (port ? ":" + port : '') + path, host, port);
    for (key in cors_headers) {
      value = cors_headers[key];
      res.setHeader(key, value);
    }
    return proxy.proxyRequest(req, res, {
      host: "google.com",//host,
      port: port
    });
    req.url = ""//path;
  }
};

//httpProxy.createServer(proxyServer).listen(process.env.PORT || 9292);
