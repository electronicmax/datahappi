define(['js/rdf/RDFCollection','js/ops/ops'],function(rdfc,ops) {           
	var apply_chain = function(src_entity,target_type) {
	    var c = chain(src_entity,target_type);
	    return c.map(function(x) { return x[x.length - 1][1]; });
	};           
	var ChainModel = rdfc.RDFModel.extend({
	    idAttribute:"_id",               
	    get_chain:function(props) {
			if (_(props).isArray()) {
				// list of properties
				return apply_chain(this, props);
			} else {
				return apply_chain(this, [props]);
			}
	    }
	});
	var ChainRDFCollection = rdfc.RDFCollection.extend({ model:ChainModel  });
	var to_model =  function(o) {
	    // might be a model -> keep a model.
	    // might be an object not a model --> coerce to model
	    
	    if (o === undefined) { throw new Error("Cant to_model on undefined "); }
	    if (!o instanceof Object) { throw new Error("Got a ", o, " require an object "); }
	    if (o instanceof Backbone.Model) { return o; }
	    return new ChainModel(o);
	};           
	var TRANSFORMERS = ops.operators;
	var EQ = function(l1,l2) {   return l1.length == l2.length && _(l1).difference(l2).length === 0;       };
	var flatten = function(L) {  return L.reduce(function(x,y) { return x.concat(y); }, []);        };           
	var DEFINED = function(x) {  return x !== undefined;    };
	var satisfies = function(entity, tgt_type) {
	    // tgt_type is an array of property names
	    // entity is a Backbone.Model
	    // console.log(" tgt type ", tgt_type, " KEYS : ", _(entity.attributes).keys(), _(tgt_type).without(_(entity.attributes).keys()));
	    if (! entity instanceof Backbone.Model) {
			console.error("Warning: Not a model, Got > ", entity);
			return false;
	    }
	    if (!_(entity.attributes).isObject()) {
			console.error("Weird entity : ", entity, entity.attributes);
	    }
	    return _(tgt_type).difference(_(entity.attributes).keys()).length == 0;
	}

	// FnCache - maintains a cache of applications of a function
	// keyed on 2 values: a model, first, and the function, second
	var FnCache = function() {
	    console.log('fncache');
	    this.cache = {}; // m_id -> [ (fn, val) ... ]
	    this.models = [];
	};
	FnCache.prototype = {
	    get_value:function(fn,m,target) {
			var m_id = m.id || m.attributes._oid;
			// console.log('getting value ', m_id);
			var apps = this.cache[m_id] && this.cache[m_id].filter(function(fnapp) { return fnapp[0] == fn && EQ(fnapp[1],target); });
			if (apps && apps.length) {
				return [true,apps[0][1]];
			}
			return [false]; // 
	    },
	    set_value:function(fn, m, target, v) {
			// fn is the function to be applied
			// m is a model                   
			var this_ = this;
			var m_id = m.id || m.attributes._oid;
			if (this.models.indexOf(m) < 0) {
				// don't have the model yet, let's keep track of it in case it changes
				this.models.push(m);
				m.bind("change", function() { this_.flush_model(m); });
			}
			var new_entry = [fn, _({}).extend(target), v];
			this.cache[m_id] = this.cache[m_id] !== undefined ? this.cache[m_id].filter(function(fnapp) { return !(fnapp[0] == fn && EQ(fnapp[1],target)); }).concat([new_entry]) : [new_entry];
			return v;
	    },
	    flush_model:function(m) {
			// console.log('trigger on ', m, ' cache clearing ', this.cache[m.id].length , ' cached items');
			delete this.cache[m.id||m.attributes._oid];
	    }
	};
	// ---------------------------------
	var _chain_cache = new FnCache();
	window._cache = _chain_cache;
	
	var chain = function(src_entity, target_type) {
	    // forward chains from the src_entity to the target_type
	    // console.log('chain ', src_entity.id || src_entity.attributes._oid, target_type);
	    var rechain = arguments.callee;
	    if (satisfies(src_entity, target_type)) {
			return [[]];
	    } // goal achieved.
	    // find transforms that will give us our current destination
	    var selected_Ts = TRANSFORMERS.filter(function(T) { return satisfies(src_entity, T.domain);    });
	    // console.log('candidates ', selected_Ts.length);
	    
	    var next = selected_Ts.map(function(T) {
			// caching turn on!!
			var cached = _chain_cache.get_value(T,src_entity,target_type);
			if (cached[0]) {
				// console.log("cached ! value ", cached);
				return cached[1];
			}
			
			// not cached; proceeed                   
			var vals = T.fn(src_entity);
			
			// might be undefined --> fail.
			if (DEFINED(vals)) {
				if (!_(vals).isArray()) { vals = [vals]; } // now val is an array, simpliifes processing
				var tails = _(vals).filter(DEFINED).map(function(v) {
					var model_v = to_model(v);
					var chain_tail = rechain(model_v,target_type);
					return chain_tail.map(function(tail_t) { return [[T,model_v]].concat(tail_t); });
				});
				var result = flatten(tails);
				return _chain_cache.set_value(T,src_entity,target_type,result);
			}                   
			// not defined
			return _chain_cache.set_value(T,src_entity,undefined);
	    }).filter(DEFINED);           
	    return flatten(next);
	};
	
	return {
	    get_rdf_collection:function(x) { return new ChainRDFCollection(x); },
	    ChainModel:ChainModel,
		to_chain_model:function(m) { return new ChainModel(m.attributes); },
	    transformers:TRANSFORMERS,
	    chain:chain,
	    apply_chain:apply_chain
	};
});
