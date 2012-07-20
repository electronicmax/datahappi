define(['js/utils'], function(util) {
	var DiffSet = function(rule, model) {
		this.rule = rule;
		this.model = model;
		this.diffs = [];
	};
	DiffSet.prototype = {
		add: function(p,v,m) {
			this.diffs.push({ m: m || this.model, p : p, v:v, replace:false} );
			return this;
		},
		replace:function(p,v,m) {
			this.diffs.push({ m: m || this.model, p : p, v:v, replace:true} );
			return this;
		},
		getDiffs:function() { return this.diffs; },
		applyDiffs:function() {
			var this_ = this;
			this.diffs.map(function(x) {
				x.m.setEntailed(util.TO_OBJ([[x.p, x.v]]), this_.rule, x.replace);
			});
		}
	};	
	return { diffs : function(rule, m) { return new DiffSet(rule, m); } };
});
