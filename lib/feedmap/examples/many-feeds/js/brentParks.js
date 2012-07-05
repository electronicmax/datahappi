(function () {
	var template = _.template('<b><%= name %></b>');

	feedMap.addFeed("brentParks", {
		name: "Parks and opens spaces in the London Borough of Brent",

		proxy: true,
		url: "http://www.brent.gov.uk/pks.nsf/parks.kml?ReadForm",
		dataType: "xml",
		contentType: "application/xml",

		showMarkers: true,
		markerOptions: {
			iconUrl: feedMap.iconRoot + 'park.png',
			shadowUrl: feedMap.iconRoot + 'shadow.png',
			iconSize: [32, 37],
			shadowSize: [51, 37],
			iconAnchor: [16, 37],
			popupAnchor: [0, -37]
		},

		showPopup: true,
		popupOptions: {
			content: function (m, mj) { template(mj); }
		},

		parse: function (r) {
			var a = [];
			$(r).find("Document > Placemark").each(function (i, el) {
				var $el = $(el);
				a.push({
					id: $el.find("description").text().trim(),
					name: $el.find("name").text().trim(),
					lat: $el.find("LookAt > latitude").text().trim(),
					lng: $el.find("LookAt > longitude").text().trim()
				});
			});
			return a;
		}
	});
}());