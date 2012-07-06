require(
	['js/rdf/RDFCollection','js/ops/chain-engine', 'js/utils'],
	function(rdfc, ce, util) {
		window.b = rdfc;
		var template = _.template('<marquee><b><%= name %></b><br><%= description %></marquee>');

		var collection;

		$.when(
			rdfc.get_rdf('http://data.southampton.ac.uk/dumps/events-diary/2012-06-29/events-diary.rdf'),
			rdfc.get_rdf('http://hip.cat/misc/rooms-and-buildings.rdf')
		).done(function(events) {
			events.fetch().then(function(data) {
				collection = new Backbone.Collection(
					_(events.models).map(function(model) {
						chainedModel = {};
						latLongModel = ce.apply_chain(model, ["latitude", "longitude"]);
						nameModel = ce.apply_chain(model, ["name"]);
						descriptionModel = ce.apply_chain(model, ["description"]);
						return latLongModel.length > 0 ?
							new Backbone.Model({
								id:model._id,
								lat:latLongModel[0].attributes.latitude,
								lat:latLongModel[0].attributes.longitude,
								name:nameModel[0] ? nameModel[0].attributes.name : "",
								description:descriptionModel[0] ? descriptionModel[0].attributes.description : ""
							}) :
							undefined;
					}).filter(function (model) {
						return !(typeof model === "undefined")
					})
				);
				console.log(collection);
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
