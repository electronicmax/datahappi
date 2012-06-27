define([],
       function() {
           initialize:function() {
               var this_ = this;
               // add our required leaflet stylesheet
               $('head').append('<link rel="stylesheet" href="../../lib/leaflet/leaflet.css" type="text/css" />');
               $.getScript('../../lib/leaflet/leaflet.js').then(
                   function() {
                       this_.render();
                   });
           },
           render:function() {
               // set up the map here.
               // Assume: this.options.el is the element you want to put the map
               var map = new L.Map(this.options.el, this.options.map_options);
               var cloudmade = new L.TileLayer('http://{s}.tile.cloudmade.com/YOUR-API-KEY/997/256/{z}/{x}/{y}.png', {
                   attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
                   maxZoom: 18
               });
           },
           addItems:function(d) {
               // clones
           },
           addItem:function(thing) {
           },
           removeItem:function() {
               
           }
       });
