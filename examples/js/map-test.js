define(['../../js/rdf/RDFCollection',
    '../../js/widgets/leafletMap',
    '../../js/ops/chain-engine'],
    function(rdfc, leafletMap) {
           /// put cool shtuff here.
           window.dse = rdfc;

           var placesCollection = rdfc.get_rdf('http://data.southampton.ac.uk/dumps/places/2012-06-06/places.rdf');

           placesCollection.fetch().then(function(data) {
             console.log(" omg data ", placesCollection);
           });
           var map = new leafletMap.LeafletWidget( {el: $('#map'), attributes: {css: {height: "400px"}} });

           map.addMarker(50.936592, -1.398697);

           window.placesCollection = placesCollection;


           return {};
       });
