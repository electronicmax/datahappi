define(['examples/lab/js/pathables','js/utils'],  function(pathables,util) {
	var Source = Backbone.Model.extend({
		idAttribute: "name",
		defaults: { name: "Things", url: "" },
		fetch:function() {
			var this_ = this;
			var d = util.deferred();
			var c = pathables.get_rdf(this.get('url'));
			c.fetch().then(function() {
				c.map(function(m) { m.set({source:this_}); });
				d.resolve(c);
			});
			return d.promise(); 
		}
	});		
	var SourceView = Backbone.View.extend({
		tagName: "li",
		className: "source",
		initialize:function() {}
	});		
	var SourceCollection = Backbone.Collection.extend({
		model:Source
	});
	return {
		Source:Source,
		SourceView:SourceView,
		SourceCollection:SourceCollection
	};
});
