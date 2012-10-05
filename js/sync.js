/**
   dh-webbox sync module
   first cut at specification implementation
**/
define(['config'], function(config) {
	var url = config.get_config().url;
	var oldsync = Backbone.sync;
	var make_path = function(graph, id) {
		return [url.trim().trim('/'), graph.trim(), encodeURIComponent(id.trim())].join('/');
	};	
	Backbone.sync = function(method, model, options) {
		var options = { url:make_path(model.graph || 'main', model.id)};
		return oldsync(method, model, _(options).chain().clone().extend(options).value());
	};
});
