(function () {
	// NOTE: Buggy schema from TfL - sometimes optimgis kml, sometimes google earth kml
	var template = _.template('<b><%= name %></b> (<%= type %>)<br><%= description %>');

	feedMap.addFeed("stations", {
		name: "Stations",
		proxy: true,
		url: feedMap.tflRoot + "4",
		dataType: "xml",
		contentType: "application/xml",
		parse: function (r) {
			var a = Jath.parse(["//station", {
				id: "@id",
				name: "name",
				description: "Placemark/description",
				coordinates: "Placemark/Point/coordinates",
				stationType: "@type"
			}], r);
			console.log(r, a)
			_(a).each(function (o) {
				o.stationType = o.stationType.replace(/#|Style/g, "");
			});
			return a;
		},
		renderMapItems: function (model, modelj) {
			var coordinates = modelj.coordinates.split(","),
				markerLocation = new L.LatLng(coordinates[0], coordinates[1]),
				Icon = L.Icon.extend({
					iconUrl: feedMap.iconRoot + '' + modelj.type + '.png',
					shadowUrl: feedMap.iconRoot + 'shadow.png',
					iconSize: new L.Point(32, 37),
					shadowSize: new L.Point(51, 37),
					iconAnchor: new L.Point(16, 37),
					popupAnchor: new L.Point(0, -37)
				});

			return new L.Marker(markerLocation, { icon: new Icon() });
		},
		mapItemClick: function (marker, model, modelj) {
			marker.bindPopup(template(modelj)).openPopup();
		}
	});
}());