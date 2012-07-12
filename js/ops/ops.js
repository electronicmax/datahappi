define(['js/rdf/name-resolver'], function(nameResolver) {
	return {
	    operators: [
			{
				domain:["within"],
				fn: function(x) {
					if (x.get("within") && x.get("within").get("http://www.w3.org/2003/01/geo/wgs84_pos#lat") && 
						x.get("within").get["http://www.w3.org/2003/01/geo/wgs84_pos#long"]) {
						return ({
							_oid: x.id,                                   
							"http://www.w3.org/2003/01/geo/wgs84_pos#lat": x.get("within").get("http://www.w3.org/2003/01/geo/wgs84_pos#lat"),
							"http://www.w3.org/2003/01/geo/wgs84_pos#long": x.get("within").get("http://www.w3.org/2003/01/geo/wgs84_pos#long")                               
						});
					}
				} 
			},
			{
				domain:["http://purl.org/NET/c4dm/event.owl#place"],
				fn: function(x) {
					if (x.get("http://purl.org/NET/c4dm/event.owl#place")) {
						return x.get("http://purl.org/NET/c4dm/event.owl#place");
					}
				}
			},
			{
				domain:["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"],
				range:["type"], // optional
				fn: function(x) {
					return { _oid: x.id, "type": x.get("http://www.w3.org/1999/02/22-rdf-syntax-ns#type") };
				}
			},                                  
			{
				domain:["http://data.ordnancesurvey.co.uk/ontology/spatialrelations/within"],
				fn: function(x) {
					if (x.get("http://data.ordnancesurvey.co.uk/ontology/spatialrelations/within")) {
						return x.get("http://data.ordnancesurvey.co.uk/ontology/spatialrelations/within") ;
					}
				}
			},
			{
				domain:["http://www.w3.org/2003/01/geo/wgs84_pos#lat", "http://www.w3.org/2003/01/geo/wgs84_pos#long"],
				range:["latitude", "longitude"],
				fn: function(x) {
					return {
						_oid: x.id,
						latitude: x.get("http://www.w3.org/2003/01/geo/wgs84_pos#lat"),
						longitude : x.get("http://www.w3.org/2003/01/geo/wgs84_pos#long")
					};
				}
			},
			{
				domain:["http://purl.org/NET/c4dm/event.owl#place"],
				range:['place name'],
				fn: function(x) {
					if (x.get("http://purl.org/NET/c4dm/event.owl#place") &&
						x.get("http://purl.org/NET/c4dm/event.owl#place").filter(function(y) { return y.get('http://www.w3.org/2000/01/rdf-schema#label'); })) {
						// 
						var labels = x.get("http://purl.org/NET/c4dm/event.owl#place").filter(function(y) {
							// gett rid of values that dont have a label first, 
							return y.get('http://www.w3.org/2000/01/rdf-schema#label');
						}).map(function(y) {
							// then get hte label
							return y.get('http://www.w3.org/2000/01/rdf-schema#label');
						});
						return ({ 'place name' : labels[0] });
					}
				}
			},
			{
				domain:["http://purl.org/dc/terms/description"],
				range:['description'],
				fn: function(x) {
					return { _oid: x.id, "description": x.get("http://purl.org/dc/terms/description")[0]  };
				}
			},
			{
				domain:["http://www.w3.org/2000/01/rdf-schema#label"],
				range:['name'],					   
				fn: function(x) {
					return { _oid:x.id, "name": x.get("http://www.w3.org/2000/01/rdf-schema#label")[0] };
				}
			},
			{
				domain:["http://xmlns.com/foaf/0.1/name"],
				range:['name'],					   					   
				fn: function(x) {
					return { _oid:x.id, "name": x.get("http://xmlns.com/foaf/0.1/name")[0] };
				}
			},
			{
				//TODO Make a chain to go from an event location to a building or room, which then have locations.
				domain:['location'],
				fn: function(event) {
					var locationModels = _(event.get('location').map(function(l) {
						return nameResolver.resolve(l);
					})).flatten();
					return { _oid:event.id, "http://purl.org/NET/c4dm/event.owl#place":locationModels };
				}
			}
		]
	};
});
