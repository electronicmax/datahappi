define(['js/models','js/utils','js/pathables'],function(m,utils,pathables) {
	var assert = utils.assert;
	var l = function() { console.log.apply(console,arguments); };
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
			l(">>> Double deref test <<< ");
			var bob = new pathables.Pathable({_id:"Bob", likes:"Jelly"});
			var tom = new pathables.Pathable({_id:"Tom", likes:"Jam"});
			var dom = new pathables.Pathable({_id:"Dom", bro:"Blah"});
			var pathCollection = new pathables.Pathables([bob, tom, dom]);
			//l("deref likes ");
			//pathCollection.try_extend_path(new pathables.PropertyDereferenceStep({property:"likes"}));
			//l("get_last_value for all models: ",pathCollection.models.map(function(p) {return p.get_last_value()}));
			l("deref bro ");
			pathCollection.try_extend_path(new pathables.PropertyDereferenceStep({property:"bro"}));
			l("get_last_value for all models: ",pathCollection.models.map(function(p) {return p.get_last_value()}));
		},
		function() {
			console.log(">>> Mega pathables test <<< ");			
			console.log("=========== Adding Bob and Tom to Pathables...");
			var bob = new pathables.Pathable({_id:"Bob", likes:"Jelly"});
			var tom = new pathables.Pathable({_id:"Tom", likes:"Jam"});
			bob.set({'bro':tom});
			tom.set({'bro':bob});
			pathCollection = new pathables.Pathables([bob, tom]);
			console.log("get_last_value for all models: ",pathCollection.models.map(function(p) {return p.get_last_value()}));
			console.log("Dereferencing on 'bro'...");
			pathCollection.try_extend_path(new pathables.PropertyDereferenceStep({property:"bro"}));
			console.log("Dereferencing on 'likes'...");
			pathCollection.try_extend_path(new pathables.PropertyDereferenceStep({property:"likes"}));
			console.log("get_last_value for all models: ",pathCollection.models.map(function(p) {return p.get_last_value()}));

			console.log("Adding Dave...");
			var dave = new pathables.Pathable({_id:"Dave", likes:"Marmite"});
			dave.set({'bro':dave});
			pathCollection.add(dave);
			console.log("get_last_value for all models: ",pathCollection.models.map(function(p) {return p.get_last_value()}));

			console.log("Adding Jeff...");
			var lemonJelly = new pathables.Pathable({_id:"Lemon Jelly", colour:"Yellow", tastes:"Repugnant"});
			var lemonJam = new pathables.Pathable({_id:"Lemon Jam", tastes:"Fetid"});
			var jeff = new pathables.Pathable({_id:"Jeff", likes:[lemonJelly, lemonJam]});
			pathCollection.add(jeff);
			console.log("get_last_value for all models: ",pathCollection.models.map(function(p) {return p.get_last_value()}));

			console.log("extending path by ->likes->tastes");
			var path = new pathables.Path();
			path.add_step(new pathables.PropertyDereferenceStep({property:'likes'}));
			path.add_step(new pathables.PropertyDereferenceStep({property:'tastes'}));
			pathCollection.try_extend_path(path);
			console.log("get_last_value for all models: ",pathCollection.models.map(function(p) {return p.get_last_value()}));
		}
	];
	return { run : function() { tests.map(function(t) { t(); }); console.log("tests complete");  } };
});
