define([],function() {
	// a happy model 
	var Maxel = Backbone.Model.extend({
		// change from standard - everything during
		idAttribute:"_id",
		initialize:function(src_json, options) {
			this.entailed = {};
			this.sameas = [];
			if (!_(src_json).isUndefined()) {
				_(this.attributes).extend( this._convert_json(src_json) );
			}
			return this;
		},
		_convert_json:function(o) {
			var cleaned = o;
			_(o).map(function(v,k) {
				if (k == '_id') { cleaned[k] = v; return; }
				if (!_(v).isUndefined() && !_(v).isArray()) { cleaned[k] = [v]; }
			});
			return cleaned;
		},
		get:function(p) {
			// check attributes first, then entailed properties
			var _got = this.constructor.__super__.get.apply(this,[p]);
			if (!_(_got).isUndefined()) { return _got; }
			return this.entailed[p] || []; // or undefined
		},
		keys:function() {
			return _(_(this.attributes).keys()).union(_(this.entailed).keys());
		},
		map:function(f) {
			var this_ = this;
			return this.keys().map(function(k) {
				return f.apply(this_, [this_.g(k), k]);
			});
		},
		entailedKeys:function() {
			return _(this.entailed).keys();
		},
		attrKeys:function() {
			return _(this.attributes).keys();
		},		
		_merge_attrs:function(target,src) {
			// merge carefully into target
			_(src).map(function(v,k) {
				if (k == '_id') { return; }
				target[k] = _(target[k] || []).union(src[k]);
			});
		},
		set:function(o) {
			this.constructor.__super__.set.apply(this, [this._convert_json(o)]);
			return this;
		},
		s:function(prop,val) {
			var arg = {};
			arg[prop] = val;
			arg = this._convert_json(arg);
			this.constructor.__super__.set.apply(this, [arg]);
			return this;
		},
		setEntailed:function(prop,val) {
			this._merge_attrs(this.entailed, this._import_json({prop:val}));
			this.trigger('changed:'+prop,val);
			this.trigger('changed',val);
		},
		setSameAs:function(m) {
			// sets m to be the sameAs us, which destructively
			// modifies us
			var this_ = this;
			if (this.sameas.indexOf(m) < 0) {
				this.sameas.push(m);
				this._merge_attrs(this.attributes,m.attributes);
				m.setSameAs(this);
				m.on('change', function(m,k) {
					_(k.changes).keys().map(function(k) {
						this_.s(k,m.g(k));
					});					
				});				
			}
			return this;
		},
		isSameAs:function(m) {
			return this.sameas.indexOf(m) >= 0;
		}		
	});
	Maxel.prototype.g = Maxel.prototype.get;
	return { Maxel : Maxel };
});
