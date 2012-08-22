define(['js/basemodel', 'js/models', 'js/utils'], function(basemodel, maxel, utils) {
	var source_modules = {
		'.rdf': 'js/rdf/rdfsource',
		'.xml': 'js/rdf/rdfsource',
		'.json': 'js/jsonsource'
	};		
	var kill_port = function(host_string) {
		return host_string.search(/:\d+/g) >= 0 ?  host_string.slice(0,host_string.indexOf(':')) : host_string;
	};
	var fetch_by_proxy = function(url,proxy_url) {
		proxy_url = proxy_url || "http://"+ kill_port(document.location.host) + ":9292";
		return $.get(proxy_url, { url : url });
	};
	
	var Source = maxel.Maxel.extend({
		idAttribute: "url",
		defaults: { url: "", modeltype: basemodel.BaseModel },
		initialize:function(attributes) {
			attributes = _({}).chain().extend(this.defaults).extend(attributes || {}).value();
			maxel.Maxel.prototype.initialize.apply(this,[attributes]);
			this._modelsbyuri = {};
		},
		_get_model : function(uri) {
			if (!(uri in this._modelsbyuri)) {
				this._modelsbyuri[uri] = new ( this.get("modeltype")[0] )({_id:uri});
				this.trigger('new-model', this._modelsbyuri[uri]); // added so that we can get notifications of creations
			}
			return this._modelsbyuri[uri];
		},
		fetch:function() {	throw new Error("fetch() is abstract in Source :: 1must be overridden");	},
		_fetch_by_proxy:fetch_by_proxy,
		_kill_port:kill_port
	});
	
	// modelclass = custom model class or basemodel.BaseModel
	// collectionclass = custom collection to put things into or Backbone.Collection
	var get_from_source = function(src_url, modelclass, collectionclass, src_name) {
		var suffix = src_url.slice(src_url.lastIndexOf('.'));
		var source_d = utils.deferred();
				
		if (source_modules[suffix] !== undefined) {
			require([source_modules[suffix]],
					function(module) {
						var src = new module.Source({ url:src_url, modeltype:modelclass, name:src_name  });						
						src.collection = new ((collectionclass || Backbone.Collection).extend({
							fetch:function() { return src.fetch(); }
						}))();
						source_d.resolve(src);
					});			
			return source_d.promise();
		}
		throw new Error("can't handle data of type ", src_url);
	};
	
	return {
		Source:Source,
		SourceCollection:Backbone.Collection,
		get_from_source:get_from_source
	};
});
