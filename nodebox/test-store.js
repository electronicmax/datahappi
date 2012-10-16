
var ns = require('nodebox/store'),
    m = require('js/models'),
    log = require('nlogger').logger(module);

var s = new ns.Store();
exports.s = s;
var connect = function() {
	return s.connect();
};

exports.test_write = function(uri) {
	uri = uri || 'http://hip.cat/emax-'+(new Date().valueOf());
	console.log('test write random ', uri);
	var model = m.DEFAULT_GRAPH.get_or_create(uri);
	log.debug(' got model ' +  model.id + ' graph >> ', model.graph.id);
	model.set('likes', m.DEFAULT_GRAPH.get_or_create('http://hip.cat/melkins'));
	s.write(model).then(function() {
		console.log("WON!");
	}).fail(function(err) { console.log("FAIL", err); });
};
exports.test_read = function(uri) {
	var mod = m.DEFAULT_GRAPH.get_or_create(uri);
	console.log('mod ', mod.id, mod.graph);
	s.read(mod).then(function() {
		console.log("WON!");
		console.log(mod.keys(), mod.keys().map(function(x) { return [x,mod.get(x), mod.get(x).id]; }));
	}).fail(function(err) { console.log("FAIL", err); });
};
if (require.main === module) {
	s.connect().then(function() {
		console.log('READY TO ROCK >> ');
		// test writing
       	// s.create_tables().then(function() { 	console.log('tables exist, ready to go ');	exports.test_write();		});
		s.read('hamburgers').then(function(m) { console.log('m ', m && m.keys() && m.keys().map(function(x) { return [x, m.get(x), m.get(x)[0].id ]; })); });
	});
}  else {
	s.connect().then(function() { console.log("Connected and READY TO ROCK "); });
}

