define(['../../js/rdf/RDFCollection',
		'../../js/widgets/leafletMap',
		'../../js/ops/chain-engine'], function(rdfc, leafletMap, ce) {
			/// put cool shtuff here.
			var map = new leafletMap.LeafletWidget( {el: $('#map'), attributes: {css: {height: "400px"}} });
			var placesCollection = rdfc.get_rdf('http://data.southampton.ac.uk/dumps/places/2012-06-06/places.rdf');

			try {
				navigator.geolocation.getCurrentPosition( function(position) {
					console.log("geoLocation: ", position);
					map.addMarker(position.coords.latitude, position.coords.longitude, true);
				});
			} catch(err) {}

			placesCollection.fetch().then(function(data) {
				console.log(" omg data ", placesCollection);
				window.placesCollection = placesCollection;

				var locations = _(placesCollection.models).map(function (m) {
					return ce.apply_chain(m, ["latitude", "longitude"]);
				}).filter(function (m) {
					return m.length > 0;
				});
				console.log( "locations: ", locations); 
				_(locations).each(function (m) {
					var latitude = m[0].attributes.latitude[0];
					var longitude = m[0].attributes.longitude[0];
					console.log("LatLng: ", latitude, ":", longitude);
					map.addMarker(latitude, longitude);
				});
			});
			return {};
		});
