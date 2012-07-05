define([],
  function() {
    var blueIcon = new L.Icon.Default();
    var greenIcon = new L.Icon({
      iconSize: new L.Point(25, 41),
      iconAnchor: new L.Point(13, 41),
      popupAnchor: new L.Point(0, -33),

      shadowSize: new L.Point(41, 41),
      iconUrl: '../../lib/leaflet/images/marker-icon-green.png',
      shadowUrl: '../../lib/leaflet/images/marker-shadow.png'
    });
    var LeafletWidget = Backbone.View.extend({
      initialize:function() {
        var this_ = this;
        // add our required leaflet stylesheet
        $('head').append('<link rel="stylesheet" href="../../lib/leaflet/leaflet.css" type="text/css" />');
        this_.render();
        this.collection = this.options.data || new Backbone.Collection();
      },
      setCollection:function(c) {
        this.collection = c;
      },
      setValueFunction:function(fn) {
        this.options.valuefn = fn;
      },
      addMarker:function(latitude, longitude, isGreen) {
        iconFile = (isGreen)? greenIcon : blueIcon;
        var marker = new L.Marker(new L.LatLng(latitude, longitude), {icon: iconFile});
        this.map.addLayer(marker);
      },
      render:function() {
        // set up the map here.
        // Assume: this.options.el is the element you want to put the map
        var this_ = this;
        this.map = new L.Map(this.el, this.options.map_options);
        var cloudmade = new L.TileLayer('http://{s}.tile.cloudmade.com/285675b50972436798d67ce55ab7ddde/997/256/{z}/{x}/{y}.png', {
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
          maxZoom: 18
        });

        function setLocation (latitude, longitude) {
          this_.map.setView(new L.LatLng(latitude, longitude), 16).addLayer(cloudmade);
        }

        try {
          navigator.geolocation.getCurrentPosition( function(position) {
            console.log(position);
            setLocation(position.coords.latitude, position.coords.longitude);
          })
        } catch (error) {
          setLocation(50.936592, -1.398697);
        }

        return this;
      }
    });
  return { LeafletWidget:LeafletWidget };
});
