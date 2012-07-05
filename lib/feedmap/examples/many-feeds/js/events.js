require(
	['js/rdf/RDFCollection','js/ops/chain-engine', 'js/utils'],
	function(rdfc, ce, util) {
		window.b = rdfc;
		var template = _.template('<b><%= name %></b><br><%= description %>');

		var collection;

		$.when(
			rdfc.get_rdf('http://data.southampton.ac.uk/dumps/events-diary/2012-06-29/events-diary.rdf'),
			rdfc.get_rdf('http://hip.cat/misc/rooms-and-buildings.rdf')
		).done(function(events) {
			events.fetch().then(function(data) {
				collection = new Backbone.Collection(
					_(events.models).map(function(model) {
						return ce.apply_chain(model, ["latitude", "longitude"]);
					}).filter(function (model) {
						return model.length > 0;
					}).map(function(model) {
						return new Backbone.Model({
							id:model[0].cid,
							lat:model[0].attributes.latitude[0],
							lng:model[0].attributes.longitude[0],
							name:"",
							description:""
						});
					})
				);
				feedMap.addFeed("events", {
					name: "Events Feed",

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
			});
		});
	}
);
