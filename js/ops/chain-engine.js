define([],
       function() {
           var EQ = function(l1,l2) {
               return l1.length == l2.length && _(l1).difference(l2).length === 0;
           };
           var flatten = function(L) {
               return L.reduce(function(x,y) { return x.concat(y); }, []);
           };           
           var DEFINED = function(x) {  return x !== undefined;    };
           var to_model = function(o) {
               return new Backbone.Model(o);
           };
           var TRANSFORMERS = [
               {
                   domain:["within"],
                   fn: function(x) {
                       if (x.get("within") && x.get("within").get("http://www.w3.org/2003/01/geo/wgs84_pos#lat") && 
                           x.get("within").get["http://www.w3.org/2003/01/geo/wgs84_pos#long"]) {
                           return to_model({
                               "http://www.w3.org/2003/01/geo/wgs84_pos#lat": x.get("within").get("http://www.w3.org/2003/01/geo/wgs84_pos#lat"),
                               "http://www.w3.org/2003/01/geo/wgs84_pos#long": x.get("within").get("http://www.w3.org/2003/01/geo/wgs84_pos#long")                               
                           });
                       }
                   } 
               },
               {
                   domain:["http://purl.org/NET/c4dm/event.owl#place"],
                   fn: function(x) {
                       "http://purl.org/NET/c4dm/event.owl#place"
                       if (x.get("http://purl.org/NET/c4dm/event.owl#place")) {
                           return  x.get("http://purl.org/NET/c4dm/event.owl#place");
                       }
                   }
               },               
               {
                   domain:["http://data.ordnancesurvey.co.uk/ontology/spatialrelations/within"],
                   fn: function(x) {
                       if (x.get("http://data.ordnancesurvey.co.uk/ontology/spatialrelations/within")) {
                           return  x.get("http://data.ordnancesurvey.co.uk/ontology/spatialrelations/within") ;
                       }
                   }
               },
               {
                   domain:["http://www.w3.org/2003/01/geo/wgs84_pos#lat", "http://www.w3.org/2003/01/geo/wgs84_pos#long"],
                   fn: function(x) {
                       return to_model({
                           latitude: x.get("http://www.w3.org/2003/01/geo/wgs84_pos#lat"),
                           longitude : x.get("http://www.w3.org/2003/01/geo/wgs84_pos#long")
                       });
                   }
               },
               {
                   domain:["http://purl.org/NET/c4dm/event.owl#place"],
                   fn: function(x) {
                       if (x.get("http://purl.org/NET/c4dm/event.owl#place") &&
                           x.get("http://purl.org/NET/c4dm/event.owl#place").filter(function(y) { return y.get('http://www.w3.org/2000/01/rdf-schema#label'); })) {
                           // 
                           var labels = x.get("http://purl.org/NET/c4dm/event.owl#place").filter(function(y) {
                               // gett rid of values that dont have a label first, 
                               return y.get('http://www.w3.org/2000/01/rdf-schema#label');
                           }).map(function(y) {
                               // then get hte label
                               return y.get('http://www.w3.org/2000/01/rdf-schema#label')[0];
                           });
                           return to_model({ 'place name' : labels[0] });
                       }
                   }
               },
               {
                   domain:["http://purl.org/dc/terms/description"],
                   fn: function(x) {
                       return to_model({
                           description: x.get("http://purl.org/dc/terms/description")[0]
                       });
                   }
               },
               {
                   domain:["http://www.w3.org/2000/01/rdf-schema#label"],
                   fn: function(x) {
                       return to_model({
                           name: x.get("http://www.w3.org/2000/01/rdf-schema#label")[0]
                       });
                   }
               },
           ];

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
               this.cache = {}; // m_id -> [ (fn, val) ... ]
               this.models = [];
           };
           FnCache.prototype = {
               get_value:function(fn,m) {
                   var m_id = m.id;
                   var apps = this.cache[m_id] && this.cache[m_id].filter(function(fnapp) { return fnapp[0] == fn; });
                   if (apps && apps.length) {
                       return apps[0][1];
                   }
                   return undefined; // 
               },
               set_value:function(fn, m, v) {
                   // fn is the function to be applied
                   // m is a model                   
                   var this_ = this;
                   var m_id = m.id;                   
                   if (this.models.indexOf(m) < 0) {
                       // don't have the model yet, let's keep track of it in case it changes
                       this.models.push(m);
                       m.bind("change", function() {  this_.flush_model(m);  });
                   }                   
                   var result = v;
                   this.cache[m_id] = this.cache[m_id] ? this.cache[m_id].filter(function(fnapp) { return fnapp[0] != fn; }).concat([fn, result]) : [[fn, result]];
                   return result;
               },
               flush_model:function(m) {
                   console.log('trigger on ', m, ' cache clearing ', this.cache[m.id].length , ' cached items');
                   delete this.cache[m.id];
               }
           };
           // ---------------------------------

           var _chain_cache = new FnCache();
           
           var chain = function(src_entity, target_type) {
               // forward chains from the src_entity to the target_type
               var rechain = arguments.callee;
               if (satisfies(src_entity, target_type)) { return [[]]; } // goal achieved.
               // find transforms that will give us our current destination
               var selected_Ts = TRANSFORMERS.filter(function(T) {  return satisfies(src_entity, T.domain); });
               var next = selected_Ts.map(function(T) {
                   var cached = _chain_cache.get_value(T,src_entity);
                   if (cached) { return cached; }
                   // not cached; proceeed                   
                   var val = T.fn(src_entity); 
                   if (_(val).isArray()) {
                       var tails = _(val).filter(DEFINED).map(function(v) {
                           var chain_tail = rechain(v,target_type);
                           return chain_tail.map(function(tail_t) { return [[T,val]].concat(tail_t); });
                       });
                       var result = flatten(tails);
                       return _chain_cache.set_value(T,src_entity,result);
                   } else if (DEFINED(val)) {
		       // we got a value directly -- let's propagate that on 
                       var chain_tail = rechain(val,target_type);
                       var result =  chain_tail.map(function(tail_t) { return [[T,val]].concat(tail_t); });
                       return _chain_cache.set_value(T,src_entity,result);
                   }                   
		   // not defined
		   return undefined;
               }).filter(DEFINED);           
               return flatten(next);
           };

           var apply_chain = function(src_entity,target_type) {
               var c = chain(src_entity,target_type);
               return c.map(function(x) { return x[x.length - 1][1]; });
           };

           return {
               transformers:TRANSFORMERS,
               chain:chain,
               apply_chain:apply_chain
           };
       });
