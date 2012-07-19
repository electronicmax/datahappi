define(['js/ops/incremental-forward'],function(rh) {

	// Maxels support:
	//    co-reference declarations (e.g, m1 iss m2)
	//    lazy forward chaining -- applies all rules all the time

	var list_EQ = function(x,y) { return x.length == y.length && _(x).difference(y).length == 0; };
	
	var Maxel = Backbone.Model.extend({
		idAttribute:"_id",
		initialize:function(src_json, options) {
			this.entailed = {};
			this.sameas = [];
			if (!_(src_json).isUndefined()) {
				_(this.attributes).extend( this._convert_json(src_json) );
			}
			this.set_up_inference(options);
			return this;
		},
		set_up_inference:function(options) {
			if (!(options && options.enable_incremental_inference)) { return ; }
			var chainer = new rh.RuleHelper({ruleset:options.inference_ruleset});
			var this_ = this;			
			var apply_rules = function(changed_props) {
				var rules = chainer.get_triggers(changed_props);
				// try each the rule
				rules.map(function(r) { try { return r.fn(this_);} catch(e) { console.log(e);}})
					.filter(function(x) { return !_(x).isUndefined(); })
					.map(function(entailed) {this_.setEntailed(entailed);});
			};
			this.on("change", function(z,k) { apply_rules(_(k.changes).keys()); });
			// first apply to all thingies
			apply_rules(this.keys());
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
			return _( (this.entailed && this.entailed[p]) || []).union( this.constructor.__super__.get.apply(this,[p]) || [] ); // or undefined
		},
		keys:function() {
			return _( _(this.attributes).keys() ).union(_(this.entailed).keys());
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
		_make_changelist:function(props) {
			var changelist = {};
			_(props).keys().map(function(k) { changelist[k] = true; });
			return changelist;
		},
		setEntailed:function(prop,val) {
			var this_ = this;
			if (val !== undefined) {
				var arg = {};
				arg[prop] = val;
				prop = arg;				
			}
			// now everything is in single object format;
			// prop = { foo : 132 }
			var new_vals = this._convert_json(prop);
			// filter new vals for only those that have actually changed
			var changed_keys = _(new_vals).keys().filter(function(x) {
				return _(new_vals[x]).difference(this_.entailed[x]) > 0;
			});
			this._merge_attrs(this.entailed, new_vals);
			var changelist = this._make_changelist(changed_keys);
			if (changed_keys.length > 0) {
				this.trigger('change', this, {changes :changelist});
				changed_keys.map(function(k) {
					this.trigger('change:'+k, this, { changes : changelist });
				});
			}
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
