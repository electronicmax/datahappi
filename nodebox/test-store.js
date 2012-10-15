
var ns = require('nodebox/store'),
    m = require('js/models'),
    log = require('nlogger').logger(module);

var s = new ns.Store();

s.connect().then(function() {
	console.log('ready to party');
       	s.create_tables().then(function() {
		console.log('tables exist, ready to go ');
		var model = m.DEFAULT_GRAPH.get_or_create('http://hip.cat/emax-'+(new Date().valueOf()));
		log.debug(' got model ' +  model.id + ' graph >> ', model.graph.id);
		model.set('loves', m.DEFAULT_GRAPH.get_or_create('http://hip.cat/melkins'));
		s.write(model).then(function() {
			console.log("WON!");
		}).fail(function(err) { console.log("FAIL", err); });
	});
});

