define(['js/source', 'examples/lab/js/pathables', 'js/utils'],  function(sources, pathables,util) {
	var SourceView = Backbone.View.extend({
		tagName: "li",
		className: "source",
		initialize:function() {}
	});
	var SourceCollection = Backbone.Collection.extend({
		model:sources.Source
	});
	return {
		SourceView:SourceView,
		SourceCollection:SourceCollection,
		get_from_source:sources.get_from_source
	};
});
