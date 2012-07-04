(function () {
	var iconSeverityColours = { moderate: "yellow", serious: "orange", severe: "green" },
		iconCategoryNames = { works: "works", accident: "accident", "signal failure": "signal", breakdown: "breakdown", incident: "incident", "event": "event", hazard: "hazard" },

		template = _.template('<b><%= title %></b> \
			(<%= category %><% switch (type) { \
				case 1: print(", in progress"); break; \
				case 2: print(", cleared"); break; \
				case 3: print(", in progress (long term)"); break; \
				case 4: print(", planned event"); break; \
				case 5: print(", planned road works"); break; \
			} %>)<br> \
			<b>Severity: <%= severity %></b><br> \
			<%= locationDescription %><br> \
			started on <%= startDate %> at <%= startTime %><br> \
			<% if (endDate !== "NULL") { %> \
			ends on <%= endDate %> at <%= endTime %><br> \
			<% } %> \
			<p><%= description %></p> \
			<% if (remark !== "NULL") { %> \
				<b>Status:</b> <%= remark %> (on <%= remarkDate %> at <%= remarkTime %>) \
			<% } %> \
			Last updated <%= updateTime %>');

	feedMap.addFeed("disruptions", {
		name: "Traffic disruptions",

		poll: 120000,
		proxy: true,
		url: feedMap.tflRoot + "13",
		dataType: "xml",
		contentType: "application/xml",

		showMarkers: true,
		markerOptions: {
			iconUrl: function (m, mj) {
				return feedMap.iconRoot + (iconCategoryNames[mj.category.toLowerCase()] || "incident") +
					'_' + (iconSeverityColours[mj.severity.toLowerCase()] || "orange") + '.png';
			},
			shadowUrl: feedMap.iconRoot + 'shadow.png',
			iconSize: [32, 37],
			shadowSize: [51, 37],
			iconAnchor: [16, 37],
			popupAnchor: [0, -37]
		},

		showPopup: true,
		popupOptions: {
			content: function (m, mj) { return template(mj); }
		},

		parse: function (r) {
			// Parse XML
			var a = Jath.parse(["//rr_event", {
				id: "ltisid",
				startDate: "eventstartdate",
				startTime: "eventstarttime",
				endDate: "eventenddate",
				endTime: "eventendtime",
				type: "event_type",
				category: "category",
				title: "title",
				sector: "sector",
				locationDescription: "location",
				description: "description",
				updateTime: "lastmodifiedtime",
				severity: "severity",
				postCodeStart: "PostCodeStart",
				postCodeEnd: "PostCodeEnd",
				remarkDate: "remarkDate",
				remarkTime: "remarkTime",
				remark: "remark",
				gridEasting: "gridEasting",
				gridNorthing: "gridNorthing"
			}], r);

			// Get lat/lngs
			_(a).each(function (o) {
				var latlng = (new OSRef(o.gridEasting, o.gridNorthing)).toLatLng();
				o.lat = latlng.lat;
				o.lng = latlng.lng;
			});

			return a;
		}
	});
}());