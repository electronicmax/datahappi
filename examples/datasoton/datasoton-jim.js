define(["./rdfcollection"],
	function(rdfcollection) {
		"strict mode";
		window.collection = rdfcollection('http://id.southampton.ac.uk/dataset/places/latest.rdf')
		window.collection = rdfcollection('http://volant.ecs.soton.ac.uk/examples/datasoton/places.rdf')
		window.collection2 = rdfcollection('http://data.southampton.ac.uk/building/58.rdf');
		collection.fetch().then(function() {
			var rdfView = Backbone.View.extend({
				el: $("ul#modelList"),
				render: function() {
					that = this;
					collection.models.map(function(model) {
						window.m = model;
						$(that.el).append("<li>"+model.attributes._id+"\n"+model.attributes["http://purl.org/dc/terms/spatial"]+"</li>");
					});
					return this;
				}
			});
			var a = new rdfView();
			a.render();
		});
	}
);
