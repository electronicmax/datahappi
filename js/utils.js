define([],function() {
	return {
		deferred:function() { return new $.Deferred(); },
		whend:function(deferred_array) { return $.when.apply($,deferred_array); },		
		t:function(template,v) { return _(template).template(v); },
		assert:function(t,s) { if (!t) { throw new Error(s); }},
		TO_OBJ: function(pairs) { var o = {};	pairs.map(function(pair) { o[pair[0]] = pair[1]; }); return o; },
		flatten:function(l) { return l.reduce(function(x,y) { return x.concat(y); }, []); }
	};
});
