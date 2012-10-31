if (typeof define !== 'function') {
	var define = require('amdefine')(module),
	    Backbone = require('backbone'),
        $ = require('jquery'),
        _ = require('underscore');
}

define([],function() {
	return {
		isInteger:function(n) { return n % 1 === 0; },
		deferred:function() { return new $.Deferred(); },
		whend:function(deferred_array) { return $.when.apply($,deferred_array); },
		t:function(template,v) { return _(template).template(v); },
		assert:function(t,s) { if (!t) { throw new Error(s); }},
		TO_OBJ: function(pairs) { var o = {};	pairs.map(function(pair) { o[pair[0]] = pair[1]; }); return o; },
		zip: function(pairs) { var o = {};	pairs.map(function(pair) { o[pair[0]] = pair[1]; }); return o; },
		flatten:function(l) { return l.reduce(function(x,y) { return x.concat(y); }, []); },
		DEFINED:function(x) { return (!_.isUndefined(x)) && x !== null; },
		defined:function(x) { return (!_.isUndefined(x)) && x !== null; },		
		indexOf_uk_postcode:function(s) {
			var re = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) {0,1}[0-9][A-Za-z]{2})$/g;
			return s.search(re);
		},
		getParameterByName: function(name) {
			name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
			var regexS = "[\\?&]" + name + "=([^&#]*)";
			var regex = new RegExp(regexS);
			var results = regex.exec(window.location.search);
			if(results == null)
				return "";
			else
				return decodeURIComponent(results[1].replace(/\+/g, " "));
		},		
		indexOf_us_zipcode:function(s) {
			// TODO::
		},
		range:function(l,h) {
			var a = [];
			if (_.isUndefined(h)) { h = l; l = 0; }
			for (var i = l; l < h; l++) { a.push(i); }
			return a;
		},
		to_numeric:function(v) {
			if (_(v).isNumber()) { return v ; }
			if (typeof(v) == 'string') { return parseFloat(v, 10); }
			return undefined; // throw new Error("Could not convert ", v);
		},
		when:function(x) {
			return $.when.apply($,x);
		},
		when_steps:function(fns, fail_fast) {
			// executes a bunch of functions that return deferreds in sequence
			var me = arguments.callee;
			var d = new $.Deferred();
			if (fns.length == 1) { return fns[0]().then(d.resolve).fail(d.reject);	}
			fns[0]().then(function() {
				me(fns.slice(1));
			}).fail(function() {
				if (fail_fast === true) { return; }
				me(fn.slice(1));
			});
			return d;
		},
		hash:function(s) {
			var hash = 0;
			if (s.length == 0) return hash;
			for (i = 0; i < s.length; i++) {
				char = s.charCodeAt(i);
				hash = ((hash<<5)-hash)+char;
				hash = hash & hash; // Convert to 32bit integer
			}
			return hash;
		}
	};
});
