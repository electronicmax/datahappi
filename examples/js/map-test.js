define(['../../js/rdf/RDFCollection',
        '../../js/widgets/leafletMap'],
       function(rdfc, leafletMap) {
           /// put cool shtuff here.
           rdfc.test().then(function(data) { console.log(" omg data ", data); });
           new leafletMap.LeafletWidget( {el: $('#map'), attributes: {css: {height: "400px"}} })
           return {};
       });
