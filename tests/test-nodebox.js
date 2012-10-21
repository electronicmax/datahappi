define(['js/models','js/utils','js/sync-nodebox',],function(m,u,sync) {
	var assert = u.assert;
	window.models = m;	
	var l = function() { console.log.apply(console,arguments); };
	tests = [
		function() {
			var d = u.deferred();
		 	var m1 = new m.Maxel({
		 		_id: "http://id.facebook.com/user/max-" + new Date().valueOf(),
		 		name : "Max the Hacker",
		 		dob: "13-april-1990"
		 	});
		 	m1.graph = m.get_graph('facebook');
			m1.save().then(function() {
				m1.set({loves:'spinach'});
				m1.save().then(function() {
					console.log(' and updated with spinach ');
					d.resolve();
				});
			});
			return d;
		},
		function() {
			var d = u.deferred();
			var nonce = (new Date()).valueOf();
			var uri = "http://id.facebook.com/user/ernie-" + nonce;
			console.log("writing a model called :", uri);
			var m1 = new m.Maxel({
				_id: uri,
				name : "ernest borgnine",
				dob: "12-jul-1990"
			});
			m1.graph = m.get_graph('facebook');
			m1.set({loves:'carrots'});
			m1.save().then(function(x) {
				console.log('saved. now -- trying to load it back ');
				var m2 = new m.Maxel({_id: uri});
				m2.graph = m.get_graph('facebook');			
				m2.fetch().then(function(x) {
					console.log('done fetching and m2 ', x, x.keys().length, m2, m2.keys(), m2.keys().length);
					d.resolve();
				});				
			});
			return d;
		}				
	];
	return {
		run : function() {
			u.when_steps(tests).then(function() { console.log("tests complete"); });
		}
	};
});
