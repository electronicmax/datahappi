(function () {
	var template = _.template('<b><%= name %></b><br> \
			CC Zone: <%= ccZone %><br> \
			Height restrictions: <%= heightRestrictions %><br> \
			Types of vehicles allowed: <%= vehicleTypesAllowed %><br>');

	feedMap.addFeed("chargePoints", {
		name: "Charge points",

		proxy: true,
		url: feedMap.tflRoot + "31",
		dataType: "json",
		contentType: "application/json",


		showMarkers: true,
		markerOptions: {
			iconUrl: feedMap.iconRoot + 'charge.png',
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
			return _(r).map(function (e) {
				return {
					id: e.id,
					name: e.name,
					lat: e.lat,
					lng: e.lng,
					ccZone: e.cc_zone,
					heightRestrictions: e.height_restrictions,
	  				vehicleTypesAllowed: e.Type_of_vehicle_allowed
	  			}
	  		});
		}
	});
}());