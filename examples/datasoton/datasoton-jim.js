define(["./rdfcollection"],
	function(rdfcollection) {
		"strict mode";
		var collection = rdfcollection('http://data.southampton.ac.uk/building/58.rdf');
		collection.fetch().then(
			var rdfView = new Backbone.View.extend({
				el: $("ul#modelList"),
				render: function() {
					that = this;
					c.models.map(function(model) {
						$(that.el).append("<li>"+model.cid+"</li>");
					});
					return this;
				},
			});
		);
	}
);
