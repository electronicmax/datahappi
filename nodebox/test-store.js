
var ns = require('./store.js');
var s = new ns.Store();

s.connect().then(function() {
	console.log('ready to party');
	s.create_tables().then(function() {
		console.log('tables exist, ready to go ');
		s.read();
	});
});


