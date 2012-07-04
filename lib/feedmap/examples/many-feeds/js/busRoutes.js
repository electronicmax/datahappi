(function () {
	var template = _.template('<b><%= name %></b>');

	function get_random_color() {
		var letters = '0123456789ABCDEF'.split('');
		var color = '#';
		for (var i = 0; i < 6; i++ ) {
		color += letters[Math.round(Math.random() * 15)];
		}
		return color;
	}

	feedMap.addFeed("busRoutes", {
		name: "London bus routes",

		proxy: false,
		url: "http://localhost/~peter/stream.csv",
		dataType: "text",
		contentType: "application/csv",

		showPolygons: true,
		polygonOptions: {
			fill: false,
			groupBy: function (m, mj) { return mj.routePath; },
			color: get_random_color
		},

		showPopup: true,
		popupOptions: {
			content: function (m, mj) { return template(modelj); }
		},

		parse: function (r) {
			var rows = r.split("\n").slice(1);

			var a = _(rows).map(function (r) {
				var cols = r.split(",");
				while (cols.length > 11) {
					cols[6] += cols.splice(7, 1)[0];
				}
				var latlng = (new OSRef(cols[7], cols[8])).toLatLng();

				return {
					id: cols[0] + "," + cols[1] + "," + cols[2],
					routePath: cols[0] + "," + cols[1],
					lat: latlng.lat,
					lng: latlng.lng
				};
			});

			// Remove invalid points
			return _(a).reject(function (o) {
				return isNaN(o.lat) || isNaN(o.lng);
			});
		}
	});
}());