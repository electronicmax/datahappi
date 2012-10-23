0
var ns = require('nodebox/store'),
    m = require('js/models'),
    u = require('js/utils'),
    _ = require('underscore'),
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
	model.set('hates', m.DEFAULT_GRAPH.get_or_create('http://hip.cat/pizza'));	
	s.write(model).then(function() { console.log('written '); }).fail(function(err) { console.log("FAIL", err); });
};
exports.test_read = function(uri, graphid) {
	var mod = graphid ? m.get_graph(graphid).get_or_create(uri) : m.DEFAULT_GRAPH.get_or_create(uri);
	console.log('mod ', mod.id, mod.graph.id);
	s.read(mod).then(function(xx) {
		console.log("result ", xx);
		console.log(mod.keys(), mod.keys().map(function(x) { return [x,mod.get(x), mod.get(x).id]; }));
	}).fail(function(err) { console.log("FAIL", err); });
};
exports.write_tons = function(num_objects, num_properties) {
	var objs = [], dfds = [];
	for (var o = 0; o < num_objects; o++) {
		var uri = 'test-object-'+(new Date().valueOf());
		var model = m.DEFAULT_GRAPH.get_or_create(uri);
		var np = num_properties; // Math.round(100*Math.random());
		for (var p = 0; p < np; p++) {
			model.attributes[ 'property-'+p ] = Math.random();
		}
		objs.push(model);
		dfds.push( u.deferred() );
	}
	var start = new Date().valueOf();
	_(objs).map(function(mod,i) {
		s.write(mod).then(function() { dfds[i].resolve(); }).fail(function(x) { console.error('ERROR ', x); });
	});
	u.when(dfds).then(function() {
		var elapsed = (new Date()).valueOf() - start;
		console.log('time elapsed ', elapsed, " - ", (num_objects/(elapsed/1000.0)), " objs/s ", (num_objects*num_properties/(elapsed/1000.0)));
	});
};

if (require.main === module) {
	s.connect().then(function() {
		console.log('READY TO ROCK >> ');
		// test writing
       	// s.create_tables().then(function() { 	console.log('tables exist, ready to go ');	exports.test_write();		});
		//s.read('hamburgers').then(function(m) { console.log('m ', m && m.keys() && m.keys().map(function(x) { return [x, m.get(x), m.get(x)[0].id ]; })); });
		s.create_tables().then(function() {
			console.log('tables exist, ready to go ');
			exports.write_tons(100, 100);
		});				
	});
}  else {
	s.connect().then(function() { console.log("Connected and READY TO ROCK "); });
}

