(function () {
	var template = _.template('<b><%= name %></b><br><%= description %>');

	feedMap.addFeed("sotonPlaces", {
		name: "Southampton University Places",

		proxy: true,
		url: "http://graphite.ecs.soton.ac.uk/geo2kml/index.php/converted.kml?uri=http%3A%2F%2Fid.southampton.ac.uk%2Fdataset%2Fplaces%2Flatest&mode=kml",
		dataType: "xml",
		contentType: "application/xml",

		showMarkers: true,
		markerOptions: {
			iconUrl: feedMap.iconRoot + 'university.png',
			shadowUrl: feedMap.iconRoot + 'shadow.png',
			iconSize: [32, 37],
			shadowSize: [51, 37],
			iconAnchor: [16, 37],
			popupAnchor: [0, -37]
		},

		showPolygons: true,

		showPopup: true,
		popupOptions: {
			content: function (m, mj) { return template(mj); }
		},

		parse: function (r) {
			var a = [];
			$(r).find("Document > Placemark").each(function (i, el) {
				var $el = $(el);
				a.push({
					id: $el.find("name").text().trim(),
					name: $el.find("name").text().trim(),
					description: $el.find("description").text().trim(),
					latlng: $el.find("Point > coordinates").text().trim(),
					boundaries: $el.find("Polygon > outerBoundaryIs > LinearRing > coordinates").text().trim(),
				});
			});
			_(a).each(function (o) {
				if (o.latlng) {
					var latlng = o.latlng.split(",")
					o.lat = latlng[1];
					o.lng = latlng[0];
				} else if (o.boundaries) {
					o.boundaries = _(o.boundaries.split("\n")).map(function (p) {
						var latlng = p.split(",");
						return [latlng[1], latlng[0]];
					});
				}
			})
			return a;
		}
	});
}());