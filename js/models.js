define(['js/ops/incremental-forward','js/utils'],function(rh,util) {

	// Maxels support:
	//    co-reference declarations (e.g, m1 iss m2)
	//    lazy forward chaining -- applies all rules all the time

	var list_EQ = function(x,y) { return x.length == y.length && _(x).difference(y).length === 0; };
	var DEFINED = function(x) { return !_(x).isUndefined(); };
	var TO_OBJ = util.TO_OBJ;
	
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
				console.log(" apply rules -- triggers ", rules.map(function(x) { return x.id; }));
				// try each the rule
				return rules.map(function(r) {
					try {
						var result = r.fn(this_);
						console.log("r > ", r, r.fn.toString(), result);
						return result;
					} catch(e) {
						console.error(e);
					}
				}).filter(function(x) { return !_(x).isUndefined(); })
					.map(function(diffset) {
						console.log('diffset > ', diffset);
						return diffset.applyDiffs();
					});
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
			return _(util.flatten(_((this.entailed && this.entailed[p])|| {}).values())).union( this.constructor.__super__.get.apply(this,[p]) || [] ); // or undefined
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
		set:function(o,options) {
			var this_ = this;
			this.constructor.__super__.set.apply(this, [this._convert_json(o), options]);
			return this;
		},
		s:function(prop,val) { return this.set(TO_OBJ([[prop,val]]));},
		_trigger_change:function(changed_props) {
			var this_ = this;
			var _make_changelist = function(props) {
				// creates strange dictionary property to conform to Backbone
				var changelist = {};
				_(props).keys().map(function(k) { changelist[k] = true; });
				return changelist;
			}, changelist = _make_changelist(changed_props);
			if (changed_props.length > 0) {
				this.trigger('change', this, { changes : changelist });
				changed_props.map(function(k) {
					this_.trigger('change:' + k, this, { changes : changelist });
				});
			}
			return;
		},
		setEntailed:function(props,rule,replace) {
			var this_ = this;
			console.log('set entailed ', props,rule,replace);
			// if replace then we're just performing a regular set
			if (replace) {
				_(props).map(function(v,p) { delete this_.entailed[p]; });
				return this.set(props);
			}
			// otherwise set entailed -- coner
			// now everything is in single object format;
			var new_vals = this._convert_json(props);
			// filter new vals for only those that have actually changed
			console.log("new vals > ", new_vals);
			var changed = TO_OBJ(
				_(new_vals).map(function(v,p) {
					var old_val = this_.entailed[p] ? this_.entailed[p][rule.id] : undefined;
					if (old_val === undefined) { old_val = []; }
					return _(v).difference(old_val).length > 0 ? [p,v] : undefined;
				}).filter(DEFINED)
			);				
			console.log("changed bits >>> ", changed);			
			_(changed).map(function(v,p) {
				this_.entailed[p] = this_.entailed[p] || {};
				this_.entailed[p][rule.id] = v;
			});
			this._trigger_change(_(changed).keys());
			return this;
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
