define(["../../js/rdf/RDFCollection"],
	function(rdfcollection) {
		"strict mode";
		var placesCollection = rdfcollection.get_rdf('http://data.southampton.ac.uk/dumps/places/2012-06-06/places.rdf');
		var eventsCollection = rdfcollection.get_rdf('http://data.southampton.ac.uk/dumps/events-diary/2012-06-29/events-diary.rdf');
		$.when(
			placesCollection.fetch(),
			eventsCollection.fetch()
		).done(function() {
		    console.log("done");                    
                    window.places = placesCollection;
                    window.events = eventsCollection;

			console.log(placesCollection);
			console.log(eventsCollection);
		}).fail(function(e) {
			console.error(e);
		});

		/*
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
		*/
	}
);
