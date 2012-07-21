define(['js/ops/incremental-forward','js/utils', 'js/rdf/RDFCollection'],function(rh,util,rdf) {

	// Maxels support:
	//    co-reference declarations (e.g, m1 iss m2)
	//    lazy forward chaining -- applies all rules all the time

	// significant change from regular models: attributes are _always_
	// arrays -- although many can be of length 0
	// var list_EQ = function(x,y) { return x.length == y.length && _(x).difference(y).length === 0; };
	
	var DEFINED = function(x) { return !_(x).isUndefined(); };
	var TO_OBJ = util.TO_OBJ;
	var chainer;
	
	var Maxel = Backbone.Model.extend({
		idAttribute:"_id",
		initialize:function(src_json, options) {
			this.entailed = {};
			this.sameas = [];
			if (!_(src_json).isUndefined()) {
				_(this.attributes).extend( this._all_values_to_arrays(src_json) );
			}
			this.set_up_inference(options);
			return this;
		},
		set_up_inference:function(options) {
			// if (!(options && options.enable_incremental_inference)) { return ; }
			if (chainer === undefined) {chainer = new rh.RuleHelper({ruleset:options && options.inference_ruleset});	}
			var this_ = this;			
			var apply_rules = function(changed_props) {
				var rules = chainer.get_triggers(changed_props);
				// console.log(" apply rules -- triggers ", rules.map(function(x) { return x.id; }));
				// try each the rule
				return rules.map(function(r) {
					try {
						var result = r.fn(this_);
						return result;
					} catch(e) {
						console.error(e);
					}
				}).filter(function(x) { return !_(x).isUndefined() && x.getDiffs().length > 0; })
					.map(function(diffset) {
						// console.log('applying diffsets ', diffset);
						return diffset.applyDiffs();
					});
			};
			this.on("change", function(z,k) { apply_rules(_(k.changes).keys()); });
			// first apply to all thingies
			apply_rules(this.keys());
			return this;
		},
		_value_to_array:function(k,v) {
			if (k == '_id') { return v; }
			if (!_(v).isUndefined() && !_(v).isArray()) {
				return [v];
			}
			return v;			
		},		
		_all_values_to_arrays:function(o) {
			if (!_(o).isObject()) {	console.error(' not an object', o); return o; }
			var cleaned = o;
			var this_ = this;
			_(o).map(function(v,k) { return this_._value_to_array(k,v); });
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
		set:function(k,v,options) {
			// check if this was called with k,v format, not {k:v} format.
			if (!_(v).isUndefined()) {
				v = this._value_to_array(k,v);
			} else {
				k = this._all_values_to_arrays(k);
			}				
			this.constructor.__super__.set.apply(this,[k,v,options]);
			return this;
		},
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
		_do_sets_and_unsets:function(s) {
			var this_ = this, sets = {};
			_(s).map(function(v,k) {
				if (_(v).isArray() && v.length === 0) {
					this_.unset(k);
				} else { sets[k] = v; }
			});
			this.set(sets);
			return this;
		},
		setEntailed:function(props,rule,replace) {
			var this_ = this;
			// if replace then we're just performing a regular set
			if (replace) {
				_(props).map(function(v,p) { delete this_.entailed[p]; });
				this._do_sets_and_unsets(props);
				return this;
			}
			// otherwise set entailed -- coner
			// now everything is in single object format;
			var new_vals = this._all_values_to_arrays(props);
			// filter new vals for only those that have actually changed
			var changed = TO_OBJ(
				_(new_vals).map(function(v,p) {
					var old_val = this_.entailed[p] ? this_.entailed[p][rule.id] : undefined;
					if (old_val === undefined) { old_val = []; }
					return _(v).difference(old_val).length > 0 ? [p,v] : undefined;
				}).filter(DEFINED)
			);				
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
	Maxel.prototype.s = Maxel.prototype.set;
	var Mollection = rdf.RDFCollection.extend({ model:Maxel });
	return {
		Maxel : Maxel,
		get_rdf:function(u) { return new Mollection(undefined, {src_url:u}); }
	};	
});
