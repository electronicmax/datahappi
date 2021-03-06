define(['js/ops/incremental-forward','js/utils'],function(rh,util) {

	// Maxels support:
	//    co-reference declarations (e.g, m1 iss m2)
	//    lazy forward chaining -- applies all rules all the time

	// significant change from regular models: attributes are _always_
	// arrays -- although many can be of length 0
	// var list_EQ = function(x,y) { return x.length == y.length && _(x).difference(y).length === 0; };
	
	var defined = util.DEFINED, dict = util.TO_OBJ, flatten = util.flatten;
	var chainer;
	
	var Maxel = Backbone.Model.extend({
		idAttribute:"_id",
		initialize:function(src_json, options) {
			var this_ = this;
			this.entailed = {};
			this.sameas = [];
			if (!_(src_json).isUndefined()) {
				this.original_json = _.clone(src_json);
				this.attributes = this._all_values_to_arrays(src_json);
			}
			this.set_up_inference(options);
			// enable debug event spy > 
			// this.on('all', function(eventType, p1, p2) { console.log('[', this_.id, '] >> ', eventType, p1, p2); });
			return this;
		},
		clone:function() {
			var c = new this.constructor(this.original_json, _({}).extend(this.options));
			c.entailed = _.clone(this.entailed);
			c.attributes = _.clone(this.attributes);
			c.sameas = _.clone(this.sameas);
			c._trigger_change(c.keys());
			return c;
		},
		set_up_inference:function(options) {
			// if (!(options && options.enable_incremental_inference)) { return ; }
			if (chainer === undefined) {chainer = new rh.RuleHelper({ruleset:options && options.inference_ruleset});	}
			var this_ = this;			
			var apply_rules = function(changed_props) {
				// console.log("applying rules ", this_.id, " >> ", changed_props);
				// try { throw new Error('stack'); } catch(e) { console.error(e); }
				var rules = chainer.get_triggers(changed_props);
				return rules.map(function(r) {
					var result = r.fn(this_);
					return result;
				}).filter(function(x) { return !_(x).isUndefined() && x.getDiffs().length > 0; })
					.map(function(diffset) {
						return diffset.applyDiffs();
					});
			};
			this.on("change", function(z,k) {
				if (_.isUndefined(k) || _.isUndefined(k.changes) || _(k.changes).keys().length === 0) {
					return; // we don't have any known changes; just terminate.
				}
				// console.log("change on ", this_.id, z, _(k.changes).keys(), 'applying rules!');
				apply_rules(_(k.changes).keys());
			});
			// first apply to all thingies
			// console.log("FIRST APPLY RULE ", this_.id);
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
			var this_ = this;
			// ?!?! this isn't doing anything (!!)
			return dict(_(o).map(function(v,k) {
				var val = this_._value_to_array(k,v);
				if (defined(val)) { return [k,val]; }
			}).filter(defined));
		},
		_get_entailed_values:function(p) {
			return flatten(_((this.entailed && this.entailed[p])|| {}).values());
		},
		get:function(p) {
			var entailed_values = this._get_entailed_values(p),
				sameas = this.sameas || [],
				sameas_entailed_vals = flatten(sameas.map(function(x) {
					return x._get_entailed_values(p).concat(x.attributes[p]||[]);
				})),
				l = _.union(entailed_values,sameas_entailed_vals, this.attributes[p] || []);
			
			if (l.length) { return l; }
		},
		keys:function() {
			return _.union(
				_(this.attributes).keys(),
				_(this.entailed).keys(),
				flatten(this.sameas.map(function(x) {
					return x.entailedKeys().concat(x.attrKeys());
				}))
			).filter(function(x) { return x !== '_id'; });
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
		set:function(k,v,options) {
			// check if this was called with k,v format, not {k:v} format.
			if (!_(v).isUndefined()) {
				v = this._value_to_array(k,v);
			} else {
				k = this._all_values_to_arrays(k);
			}				
			return Backbone.Model.prototype.set.apply(this,[k,v,options]);
		},
		_make_changelist : function(props) {
			// creates strange dictionary property to conform to Backbone
			var changelist = {};
			_(props).map(function(k) { changelist[k] = true; });
			return { changes: changelist, source: this };
		},
		_trigger_change:function(changed_props) {
			var this_ = this;
			var changelist = this._make_changelist(changed_props);
			if (changed_props.length > 0) {
				this.trigger('change', this, changelist );
				changed_props.map(function(k) {
					this_.trigger('change:' + k, this, changelist);
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
		setEntailed:function(props,rule,replace,options) {
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
			var changed = dict(
				_(new_vals).map(function(v,p) {
					var old_val = this_.entailed[p] ? this_.entailed[p][rule.id] : undefined;
					if (old_val === undefined) { old_val = []; }
					return _(v).difference(old_val).length > 0 ? [p,v] : undefined;
				}).filter(defined)
			);				
			_(changed).map(function(v,p) {
				this_.entailed[p] = this_.entailed[p] || {};
				this_.entailed[p][rule.id] = v;
			});
			if (!options || !options.silent) { this._trigger_change(_(changed).keys()); }
			return this;
		},
		setSameAs:function(m) {
			// sets m to be the sameAs us, which destructively
			// modifies us
			var this_ = this;
			if (m !== this && this.sameas.indexOf(m) < 0) {
				this.sameas.push(m);
				this.sameas.map(function(sa) { m.setSameAs(sa); });
				m.setSameAs(this);
				m.on('all', function(eventType,m,options) {
					if (_(options).isUndefined() || _(options.reflected_from_sameas).isUndefined()) {
						this_.trigger(eventType,  m,  _(options || {}).extend({reflected_from_sameas: true}));
					}
				}, this);
				this.trigger('change:sameas');
			}
			return this;
		},
		unsetSameAs:function(m) {
			// unsets m to be the sameAs us, which destructively
			// modifies us
			throw new Error("don't use me ");

			// var this_ = this;
			// if (this.sameas.indexOf(m) >= 0) {
			// 	this.sameas = _(this.sameas).without(m);
			// 	m.unsetSameAs(this);
			// 	console.log("UNBINDING ", m.id, ' from ', this.id);
			// 	m.off(null, null, this);
			// 	this.trigger('change:sameas');
			// }
			// return this;
		},
		clearSameAs:function() {
			// unsets m to be the sameAs us, which destructively
			// modifies us
			var this_ = this;
			var oldsameas = this.sameas.concat([]);
			this.sameas = [];			
			oldsameas.map(function(m) {
				// console.log('!!!!!!!!!!!!! disconnecting ', m.id, ' -> from -> ', this_.id, ' with context ', this_  );
				m.off(null, null, this_);
				m.clearSameAs();
			});
			this.trigger('change:sameas');
			return this;
		},				
		valueOf:function() { return this.id; },
		isSameAs:function(m) {
			return this.sameas.indexOf(m) >= 0;
		},
		get_label:function() {
			if (this.sameas.length == 0) { return this._get_label(); }
			return _(this.sameas.concat([this]).map(function(m) { return m._get_label(); })).uniq().sort().join(' / '); 
		},
		get_labels:function() {
			if (this.sameas.length == 0) { return [this._get_label()]; }
			return _(this.sameas.concat([this]).map(function(m) { return m._get_label(); })).uniq().sort();
		},
		_get_label:function() {
			var m = this.toJSON();
			var lastpath = function(x) {
				if (x.indexOf('#') >= 0) {  return x.slice(x.lastIndexOf('#')+1); }
				return x.slice(x.lastIndexOf('/')+1);
			};
			var label = this.get('label') && this.get('label')[0]
				|| m['http://www.w3.org/2000/01/rdf-schema#label']
				|| m['label'];
			if (label && _(label).isString() && m._id) {
				label = label;          
			} else if (label && _(label).isArray() && m._id) {
				label = label[0];
			} else if (_(label).isUndefined() && m._id) {
				label = lastpath(m._id);
			} else if (_(label).isUndefined() && _(m).isObject()) {
				label = _(m).map(function(v,k){ return k+":"+v.valueOf().toString(); }).join(',');
			} else {
				label = m.valueOf().toString();
			}
			return label;			
		}
	});
	Maxel.prototype.g = Maxel.prototype.get;
	Maxel.prototype.s = Maxel.prototype.set;
	return {
		Maxel : Maxel,
	};	
});
