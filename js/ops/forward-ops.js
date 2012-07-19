define(['js/rdf/name-resolver'], function(nameResolver) {
	return {
		operators: [
			{
				domain:["http://purl.org/NET/c4dm/event.owl#place"],
				fn: function(x) {
					if (x.get("http://purl.org/NET/c4dm/event.owl#place") &&
						x.get("http://purl.org/NET/c4dm/event.owl#place")[0].get("http://www.w3.org/2003/01/geo/wgs84_pos#lat") &&
						x.get("http://purl.org/NET/c4dm/event.owl#place")[0].get("http://www.w3.org/2003/01/geo/wgs84_pos#long")) {
					} return {
						"http://www.w3.org/2003/01/geo/wgs84_pos#lat": x.get("http://purl.org/NET/c4dm/event.owl#place")[0].get("http://www.w3.org/2003/01/geo/wgs84_pos#lat"),
						"http://www.w3.org/2003/01/geo/wgs84_pos#long": x.get("http://purl.org/NET/c4dm/event.owl#place")[0].get("http://www.w3.org/2003/01/geo/wgs84_pos#long")
					};					
				}
			},
			{
				domain:["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"],
				fn: function(x) {
					return {  "type": x.get("http://www.w3.org/1999/02/22-rdf-syntax-ns#type") };
				}
			},
			{
				domain:[],
				fn: function(x) {
					var cleaned = {};
					x.map(function(v,k) {
						var lio = Math.max(0,k.lastIndexOf('/') + 1,k.lastIndexOf('#') + 1);
						cleaned[k.substring(lio)] = v;
					});
					return cleaned;
				}
			}
		]
	};
});