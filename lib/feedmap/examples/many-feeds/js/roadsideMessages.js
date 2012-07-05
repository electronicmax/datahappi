(function () {
	var template = _.template('<b><%= signtext %></b><br>on <%= roadnr %>');

	feedMap.addFeed("roadsideMessages", {
		name: "Road side messages",

		url: feedMap.proxyServer + encodeURIComponent(feedMap.tflRoot + "14"),
		dataType: "xml",
		contentType: "application/xml",

		showMarkers: true,
		markerOptions: {
			iconUrl: feedMap.iconRoot + 'message.png',
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
			var a = Jath.parse(["//vmssign", {
				id: "siteid",
				signtext: "signtext",
				roadnr: "roadnr",
				gridEasting: "easting",
				gridNorthing: "northing"
			}], r);
			_(a).each(function (o) {
				var latlng = (new OSRef(o.gridEasting, o.gridNorthing)).toLatLng();
				o.lat = latlng.lat;
				o.lng = latlng.lng;
			});
			return a;
		}
	});
}());