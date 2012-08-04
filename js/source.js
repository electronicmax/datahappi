define(['js/basemodel', 'js/utils'], function(basemodel, utils) {
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
	
	var Source = Backbone.Model.extend({
		idAttribute: "name",
		defaults: { name: "Things", url: "", modeltype: basemodel.BaseModel },
		initialize:function() {
			Backbone.Model.prototype.initialize.apply(this,arguments);
			this._modelsbyuri = {};
		},
		_get_model : function(uri) {
			if (!(uri in this._modelsbyuri)) {
				this._modelsbyuri[uri] = new ( this.get("modeltype") )({_id:uri});
			}
			return this._modelsbyuri[uri];
		},
		_fetch_by_proxy:fetch_by_proxy,
		_kill_port:kill_port
	});
	var SourceCollection = Backbone.Collection.extend({
		model:Source
	});

	// modelclass = custom model class or basemodel.BaseModel
	// collectionclass = custom collection to put things into or Backbone.Collection
	var get_from_source = function(src_url, modelclass, collectionclass) {
		var suffix = src_url.slice(src_url.lastIndexOf('.'));
		if (source_modules[suffix] !== undefined) {
			var source_d = utils.deferred();
			var collection = new ((collectionclass || Backbone.Collection).extend({
				fetch:function() {
					var this_ = this;
					var p = utils.deferred();
					source_d.then(function(source) {
						this_.source = source;
						source.fetch().then(p.resolve);
					});
					return p.promise();						
				}
			}))();
			require([source_modules[suffix]],
					function(module) {
						source_d.resolve(new module.Source({ src_url:src_url, modeltype:modelclass, collection:collection} ));
					});
			return collection;			
		}
		throw new Error("can't handle data of type ", src_url);
	};
	
	return {
		Source:Source,
		SourceCollection:SourceCollection,
		get_from_source:get_from_source
	};
});
