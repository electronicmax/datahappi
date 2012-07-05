require(
	['js/rdf/RDFCollection','js/ops/chain-engine', 'js/utils'],
	function(rdfc, ce, util) {
		window.b = rdfc;
		console.log("loaded events");
		var template = _.template('<b><%= name %></b><br><%= description %>');

		var collection = window.p = new Backbone.Collection({
			/* blah */
		});

		collection.reset([
			{id: 12, lat: 50.842941, lng: -0.131312, name: "Brighton", description: "paradise"},
			{id: 40, lat: 50.844, lng: -0.216, name: "Portslade", description: "blah"}]);

		feedMap.addFeed("collectionTest", {
			name: "Collection test",

			collection: collection,

			showMarkers: true,
			markerOptions: {
				iconUrl: feedMap.iconRoot + 'university.png',
				shadowUrl: feedMap.iconRoot + 'shadow.png',
				iconSize: [32, 37],
				shadowSize: [51, 37],
				iconAnchor: [16, 37],
				popupAnchor: [0, -37]
			},

			showPopup: true,
			popupOptions: {
				content: function (m, mj) { return template(mj); }
			}
		});
	}
);
