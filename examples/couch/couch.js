define([],
       function() { 
           var COUCH_PORT = 8000;
           var COUCH_URL = 'http://'+document.location.host+":"+COUCH_PORT;
           var Test  = {
               geolocate: function() {
                   var d = new $.Deferred();
                   if (navigator.geolocation) {
                       navigator.geolocation.getCurrentPosition( d.resolve, d.fail ); 
                   };
                   return d.promise();
               },
               setCurrentLocation : function(db, position) {
                   // console.log("position", position.coords);
                   db.saveDoc({when:new Date(), position: position.coords});                            
                   $('h3').html('@ ' + position.coords.latitude + 'N by ' + position.coords.longitude + 'W');
               }    
           };           
           $.getScript(COUCH_URL + "/_utils/script/jquery.couch.js",
                       function() {
                           console.log("Connecting to Couch at >> ", COUCH_URL);
                           $.couch.urlPrefix = COUCH_URL;    
                           $.couch.allDbs({
                               success:function(res) {
                                   console.log('Successfully connected : Databases: ', res);
                                   if (res.indexOf("places_ive_been") < 0) {
                                       console.log("making database places_ive_been");
                                       $.couch.db('places_ive_been').create();
                                   }
                                   var pib = $.couch.db('places_ive_been');
                                   setInterval(function() { Test.geolocate().then(function(X) { Test.setCurrentLocation(pib, X); }); }, 1000);
                               }
                           });
                       });

           return {}; // not exporting any symbols
       });
                                             
                       

