define([],function() {
	return {
		deferred:function() { return new $.Deferred(); },
		t:function(template,v) { return _(template).template(v); }               
	};
});
