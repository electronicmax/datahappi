define(['js/utils'], function(util) {
	var uniq = _.uniq;
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
			var ds = this.diffs.map(function(x) {
				x.m.setEntailed(util.TO_OBJ([[x.p, x.v]]), this_.rule, x.replace, {silent:true});
				return [x.m,x.p];
			});

			// take 
			uniq(ds.map(function(x) { return x[0]; })) // take uniq models
				.map(function(m) {
					// take uniq properties
					var ps = uniq(ds.filter(function(d) { return d[0] == m ;}).map(function(x) { return x[1]; }));
					// console.log('change list of ', m.id, ' >> ', ps, m._make_changelist(ps));
					m.trigger('change', m, m._make_changelist(ps));
				});
			
		}
	};	
	return { diffs : function(rule, m) { return new DiffSet(rule, m); } };
});
