define([],function() {
	return {
		deferred:function() { return new $.Deferred(); },
		whend:function(deferred_array) { return $.when.apply($,deferred_array); },		
		t:function(template,v) { return _(template).template(v); },
		assert:function(t,s) { if (!t) { throw new Error(s); }},
		TO_OBJ: function(pairs) { var o = {};	pairs.map(function(pair) { o[pair[0]] = pair[1]; }); return o; },
		flatten:function(l) { return l.reduce(function(x,y) { return x.concat(y); }, []); },
		DEFINED:function(x) { return !_.isUndefined(x); },
		indexOf_uk_postcode:function(s) {
			var re = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) {0,1}[0-9][A-Za-z]{2})$/g;
			return s.search(re);
		},
		indexOf_us_zipcode:function(s) {
			// TODO::
		}				
	};
});
