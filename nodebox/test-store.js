
var ns = require('nodebox/store'),
    m = require('js/models'),
    log = require('nlogger').logger(module);

var s = new ns.Store();
var connect = function() {
	return s.connect();
};

var test_write_random = function() {
	var model = m.DEFAULT_GRAPH.get_or_create('http://hip.cat/emax-'+(new Date().valueOf()));
	log.debug(' got model ' +  model.id + ' graph >> ', model.graph.id);
	model.set('loves', m.DEFAULT_GRAPH.get_or_create('http://hip.cat/melkins'));
	s.write(model).then(function() {
		console.log("WON!");
	}).fail(function(err) { console.log("FAIL", err); });
};

if (require.main === module) {
	s.connect().then(function() {
		console.log('READY TO ROCK >> ready to party');
       	s.create_tables().then(function() {
			console.log('tables exist, ready to go ');
			test_write_random();
		});
	});
}  else {
	s.connect().then(function() { console.log("Connected and READY TO ROCK "); });
}
