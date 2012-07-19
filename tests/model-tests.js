define(['js/models','js/utils'],function(m,utils) {
	var assert = utils.assert;
	tests = [
		function() {
			var m1 = new m.Maxel({_id: "http://id.facebook.com/user/203920392", name : "Max Van Kleek", dob: "13-april-1990" });
			var m2 = new m.Maxel({_id: "http://plus.google.com/id//203920392", name : "max electronic van kleek", posts:["foo"] });
			assert(m1.keys().length == 3, "keys mismatch");
			assert(m2.keys().length == 3, "keys mismatch");
			m1.setSameAs(m2);
			console.log('merge keys ', m1.keys());
			assert(m1.keys().length == 4, "merge keys mistmatch");
		}
	];
	return { run : function() { tests.map(function(t) { t(); }); } };
});
