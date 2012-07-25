define(['js/models','js/utils','js/pathables'],function(m,utils,pathables) {
	var assert = utils.assert;
	tests = [
		function() {
			var m1 = new m.Maxel({_id: "http://id.facebook.com/user/203920392", name : "Max Van Kleek", dob: "13-april-1990" });
			var m2 = new m.Maxel({_id: "http://plus.google.com/id/203920392", name : "max electronic van kleek", posts:["foo"] });
			assert(m1.keys().length == 3, "keys mismatch");
			assert(m2.keys().length == 3, "keys mismatch");
			m1.setSameAs(m2);
			console.log('merge keys ', m1.keys());
			assert(m1.keys().length == 4, "merge keys mistmatch");
			assert(m1.map(function(x) { return x; }).length == m1.keys().length, "map !== keys");
			console.log(m1.map(function(v,k) { return v; }));
			// set test
			m1.s("bar", "baz");
			assert(m2.g('bar').length == 1 && m2.get('bar')[0] == 'baz', "set didn't work" );
			m2.s("zab", "rab");
			assert(m1.g('zab').length == 1 && m1.get('zab')[0] == 'rab', "set didn't work" );
		},
		function() {
			// chaining!
			var m1 = new m.Maxel(
				{_id: "http://id.facebook.com/user/203920392", name : "Max Van Kleek", dob: "13-april-1990", "http://foo.com/bar": "quux" },
				{ enable_incremental_inference: true }
			);
			console.log(" keys ", m1.keys(), m1.attributes, m1.entailed);
			window.m1 = m1;
			m1.s('foo#bar','foo');
			m1.unset('foo#bar');
		},
		function() {
			// from rdf
			var path = document.location.pathname;
			var basepath = path.slice(0,path.lastIndexOf('/')); // chop off 2 /'s
			basepath = basepath.slice(0,Math.max(0,basepath.lastIndexOf('/'))) || '/';

			var val = "http://"+document.location.host+[basepath,'tests','rooms-and-buildings.rdf'].join('/');
			var events = ("http://"+document.location.host+ [basepath,'tests','events-diary.rdf'].join('/'));
			var c = new m.get_rdf(val);
			c.fetch().then(function(x) { window.EVTs = c; console.log('done!'); });
		},
		function() {
			var bob = {_id:"Bob", likes:"Jelly"};
			var tom = {_id:"Tom", likes:"Jam"};
			bob['bro'] = tom;
			tom['bro'] = bob;
			var bros = [new pathables.Pathable(bob), new pathables.Pathable(tom)];

			pathCollection = new pathables.Pathables(bros);

			console.log("before extend", pathCollection);
			var step = new pathables.PropertyDereferenceStep({property:"likes"});
			pathCollection.try_extend_path(step);
			console.log("after extend", pathCollection);
		}
	];
	return { run : function() { tests.map(function(t) { t(); }); console.log("tests complete");  } };
});
