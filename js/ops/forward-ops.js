define(['js/rdf/name-resolver','js/ops/rule-diffs'], function(nameResolver, diffs) {
	return {
		operators: [
			{
				id:'place',
				domain:["http://purl.org/NET/c4dm/event.owl#place"],
				fn: function(x) {
					if (x.get("http://purl.org/NET/c4dm/event.owl#place") &&
						x.get("http://purl.org/NET/c4dm/event.owl#place")[0].get("http://www.w3.org/2003/01/geo/wgs84_pos#lat") &&
						x.get("http://purl.org/NET/c4dm/event.owl#place")[0].get("http://www.w3.org/2003/01/geo/wgs84_pos#long")) {
						return diffs.diffs(this,x)
							.add("http://www.w3.org/2003/01/geo/wgs84_pos#lat", x.get("http://purl.org/NET/c4dm/event.owl#place")[0].get("http://www.w3.org/2003/01/geo/wgs84_pos#lat"))
							.add("http://www.w3.org/2003/01/geo/wgs84_pos#long", x.get("http://purl.org/NET/c4dm/event.owl#place")[0].get("http://www.w3.org/2003/01/geo/wgs84_pos#long"));											} 
				}
			},
			{
				id:'clean url',
				domain:[],
				fn: function(x) {
					var result = diffs.diffs(this,x);
					x.map(function(v,k) {
						var lio = k.substring(Math.max(0,k.lastIndexOf('/') + 1,k.lastIndexOf('#') + 1));
						if (lio == k) { return; }
						result.replace(k,[]); // eliminate old name with URI
						result.add(lio,v);
					});
					return result;
				}
			}
		]
	};
});
