define(['js/models','js/utils','js/sync-objectstore',],function(m,utils,sync) {
	var assert = utils.assert;
	window.models = m;	
	var l = function() { console.log.apply(console,arguments); };
	tests = [
		function() {
			var m1 = new m.Maxel({
				_id: "http://id.facebook.com/user/max-" + new Date().valueOf(),
				name : "Max the Hacker",
				dob: "13-april-1990"
			});
			m1.graph = m.get_graph('facebook');
			m1.save();
			m1.set({loves:'spinach'});
			m1.save();
		// 	window.m1 = m1;
		// 	m1 = new m.Maxel({_id: "http://id.facebook.com/user/james", name : "james acres", dob: "13-april-1995" });
		// 	m1.save();			
		},
		function() {
			var m1 = new m.Maxel({_id: "http://id.facebook.com/user/max", name : "Max Van Kleek", dob: "13-april-1990" });
			m1.graph = m.get_graph('facebook');
			m1.on('change', function(x) {
				console.log('omg change ', x);
			});
			m1.fetch().then(function(x) {
				console.log('done fetching and m1 ', m1, m1.keys());
			});
		},
				
	];
	return { run : function() {
		tests.map(function(t) {
			console.log(" >>>>>>>>>> ", tests.indexOf(t));
			t();
		}); console.log("tests complete");  } };
});
