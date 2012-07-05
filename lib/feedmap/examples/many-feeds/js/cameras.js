(function () {
	var template = '<b><%= title %></b><br><img src="<%= link %>" data-src="<%= link %>" width="200" class="camera"><br>' +
		'Image not available? <a href="javascript:console.log(\'do something\')" class="report">Report it</a>.';

	feedMap.addFeed("cameras", {
		name: "Traffic CCTV",

		proxy: true,
		url: feedMap.tflRoot + "3",
		dataType: "xml",
		contentType: "application/xml",

		showMarkers: true,
		markerOptions: {
			iconUrl: feedMap.iconRoot + 'camera.png',
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
			Jath.resolver = function(prefix) {
				if (prefix === "geo") { return "http://www.tfl.gov.uk/tfl/syndication/namespaces/geo"; }
			}
			var a = Jath.parse(["//item", {
				id: "guid",
				title: "title",
				link: "link",
				lat: "geo:Point/geo:lat",
				lng: "geo:Point/geo:long"
			}], r);
			a = _(a).reject(function (o) {
				return o.lat === "NaN" || o.lng === "NaN";
			});
			return a;
		}
	});

	$(document).ready(function () {
		setTimeout(function () {
			$(".leaflet-popup-content .camera").each(function (i, el) {
				var $el = $(el);
				$el.attr("src", $el.data("src") + "#" + (new Date()).getTime());
			});
		}, 60000);
	})
}());