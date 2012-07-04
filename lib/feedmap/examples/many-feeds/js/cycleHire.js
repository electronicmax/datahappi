(function () {
	var template = _.template('<b><%= name %></b><br> \
		name: <%= name %><br> \
		terminalName: <%= terminalName %><br> \
		lat: <%= lat %><br> \
		lng: <%= lng %><br> \
		installed: <%= installed %><br> \
		locked: <%= locked %><br> \
		installDate: <%= installDate %><br> \
		removalDate: <%= removalDate %><br> \
		temporary: <%= temporary %><br> \
		nbBikes: <%= nbBikes %><br> \
		nbEmptyDocks: <%= nbEmptyDocks %><br> \
		nbDocks: <%= nbDocks %>');

	feedMap.addFeed("cycleHire", {
		name: "Cycle hires",

		proxy: true,
		url: "http://www.tfl.gov.uk/tfl/syndication/feeds/cycle-hire/livecyclehireupdates.xml",
		dataType: "xml",
		contentType: "application/xml",

		showMarkers: true,
		markerOptions: {
			iconUrl: feedMap.iconRoot + 'cycle.png',
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
			return Jath.parse(["//station", {
				id: "id",
				name: "name",
				terminalName: "terminalName",
				lat: "lat",
				lng: "long",
				installed: "installed",
				locked: "locked",
				installDate: "installDate",
				removalDate: "removalDate",
				temporary: "temporary",
				nbBikes: "nbBikes",
				nbEmptyDocks: "nbEmptyDocks",
				nbDocks: "nbDocks"
			}], r);
		}
	});
}());