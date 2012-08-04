define(['js/source', 'js/basemodel','js/utils', 'js/rdf/name-resolver'],
	function(source, basemodel, utils, nameresolver) {
		var RDFSource = source.Source.extend({
			initialize:function() {
				source.Source.prototype.initialize.apply(this,arguments);
				console.log("loading rdf from ", this.options && this.options.src_url);
			},
			_convert_values : function(o) {
				var this_ = this;
				var convert_rdfv = function(v){
					if (v === undefined) { return; }
					return v.map(function(vv) {
						if (vv.type === 'literal') { return vv.value; }
						if (vv.type === 'uri' || vv.type == 'bnode') {
							return this_._get_model(vv.value);
						}
						throw new Error("dont know how to handle ", vv);
					});
				};                            
				var new_o = {};
				_(o).map(function(v,k) { new_o[k] = convert_rdfv(v); });
				return new_o;
			},                        
			fetch:function() {
				var this_ = this;
				var d = new $.Deferred();
				var c = new Backbone.Collection();
				utils.assert(this.options && this.options.src_url, "No src url defined :( ");
				this._fetch_by_proxy(this.options.src_url).then(function(xml) {
					/* Preprocess - Fix all buggy dates */
					var startTimes = Array.prototype.slice.call(xml.getElementsByTagNameNS("*", "start"));
					var endTimes = Array.prototype.slice.call(xml.getElementsByTagNameNS("*", "end"));
					var allTimes = [].concat(startTimes, endTimes);
					_(allTimes).each(function (el) {
						el.textContent = el.textContent.replace(/ ([0-9][0-9]:[0-9][0-9]:[0-9][0-9])/, 'T$1');
					});                           
					var dbload = $.rdf().load(xml, {});
					var json = dbload.databank.dump();
					var json_ms = _(json).keys().map(function(k) {
						var m = this_._get_model(k);
						m.set(_({_id:k, source:this_}).extend(this_._convert_values(json[k])));
						// register its names with named entity resolver
						nameresolver.register_model(m);						
						return m;
					});
					c.reset(json_ms);
					d.resolve(c);
				}, function(err) {
					console.error("Fetch failed with status " + err.status + ", check the proxy is running: $> ps -a | grep proxy");
				});
				return d;
			}
		});           
		return {
			Source:RDFSource,
			get_rdf:function(rdfSource){
				console.log("get_rdf source", rdfSource);
				return new RDFSource({src_url:rdfSource}).fetch();
			}
		};
	});
