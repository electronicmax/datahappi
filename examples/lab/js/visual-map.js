define(['js/models', 'js/utils'], function(models, utils) {

	var defined = utils.DEFINED;
	var zones = [0,1,2,3];	
	var MapVisual = Backbone.View.extend({
		apiKey:	'285675b50972436798d67ce55ab7ddde',
		className:'visual-map',
		tagName:'div',
		template:'<div class="titlebar">Map</div><div class="delete icon-cancel"></div><div class="dropzones"></div><div class="map-zone"></div><div class="warnings"></div>',
		events : {
			'click .delete' : '_cb_delete',
			'click .titlebar' : '_cb_raise',
			'click' : '_cb_raise'			
		},
		defaults : { center:[51.505, -0.09], zoom:13 },
		marker_icons : {
			0:new L.Icon({iconUrl:'../../lib/leaflet/images/marker-icon.png', iconSize: new L.Point(25, 41), iconAnchor: new L.Point(13, 41),popupAnchor: new L.Point(1, -34),shadowSize: new L.Point(41, 41)}),
			1:new L.Icon({iconUrl:'../../lib/leaflet/images/marker-orange.png', iconSize: new L.Point(25, 41), iconAnchor: new L.Point(13, 41),popupAnchor: new L.Point(1, -34),shadowSize: new L.Point(41, 41)}),
			2:new L.Icon({iconUrl:'../../lib/leaflet/images/marker-icon-green.png', iconSize: new L.Point(25, 41), iconAnchor: new L.Point(13, 41),popupAnchor: new L.Point(1, -34),shadowSize: new L.Point(41, 41)}),
			3:new L.Icon({iconUrl:'../../lib/leaflet/images/marker-red.png', iconSize: new L.Point(25, 41), iconAnchor: new L.Point(13, 41),popupAnchor: new L.Point(1, -34),shadowSize: new L.Point(41, 41)})
		},
		initialize:function() {
			this.options = _.extend(this.defaults, this.options);
			this.dropzone_boxes = {};
			this.markers_by_box = {};
			this.brushed = [];
		},
		render:function() {
			var this_ = this;
			this.$el.html(this.template);
			this.$el.draggable({
				handle:this.$el.find('.dropzones').add(this.$el.find('.titlebar')),
				drag:function(evt,ui) { this_.trigger('drag', ui.offset); }
			});
			this.$el.css('top', 50 + 100*Math.random());
			this.$el.css('left', 50 + 100*Math.random());
			this.$el.data('view', this);
			var dropzone = "<div class='dropzone'></div>";
			[0,1,2,3].map(function(i) {
				$(dropzone).addClass('dropzone-'+i).appendTo(this_.$el.find('.dropzones'));
			});
			this.$el.find('.dropzone').droppable({
				greedy:true,  accept:'.greybox', tolerance:"pointer",
				over:function(event, ui) {
					$(this).addClass("over");
					//$(this).find('.lbl').html('ok!'); 
				},
				out:function(event, ui) {
					$(this).removeClass("over");
					// $(this).find('.lbl').html('drop here');
				},
				drop: function( event, ui ) {
					var views = ui.draggable.data("views")();
					var dropzone_i = this_.$el.find('.dropzone').index($(this));
					$(this).removeClass("over");
					// $(this).find('.lbl').html('' + views.length + 'items');
					this_.setDropzoneBox(ui.draggable.data("view"), dropzone_i);
					// reset position
					var start_pos = ui.draggable.data("drag_start_position");
					ui.draggable.data("view").setTopLeft(start_pos.top, start_pos.left, true);
				}
			});
			this.$el.resizable({resize:function() { this_.map.invalidateSize(false); }});
			return this;
		},
		_make_popup_text:function(pathable,val) {
			var template = "<div class='map-marker-popup'><div class='title'><%= model %></div><div class='value label'><%= value %></div></div>";
			return _(template).template(
				{
					model : pathable.model.get_label(),
					value : val.get_label ? val.get_label() : val.valueOf()
				});
		},
		get_lat_lng:function(val) {
			if (val instanceof models.Maxel) {
				if (defined(val.get('lat')) && val.get('lat').length &&
					defined(val.get('long')) && val.get('long').length) {
					return { lat: val.get('lat')[0], long: val.get('long')[0] };
				}
				if (defined(val.get('lat')) && val.get('lat').length &&
					defined(val.get('lon')) && val.get('lon').length) {
					return { lat: val.get('lat')[0], long: val.get('lon')[0] };
				}									
			}
			return;
		},
		update:function() {
			var this_ = this;			
			// only works upon attachment
			if (_(this.map).isUndefined() && $('body').find(this.$el[0]).length)  {			
				// make the google map
				this.map = L.map(this.$el.find('.map-zone')[0]).setView(this.options.center, this.options.zoom);
				L.tileLayer(
					_('http://{s}.tile.cloudmade.com/<%= apikey %>/997/256/{z}/{x}/{y}.png').template({apikey:this.apiKey}),
					{
						attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
						maxZoom: 18
					}).addTo(this.map);
			}

			if (_(this.map).isUndefined()) { console.log('map is undefined :( '); return;}

			var remove_markers = function(markers) {
				if (markers.length == 0) { return; }
				_(markers).each(function(marker, kk) {
					if (defined(marker)) {
						console.log('removing marker ', marker, kk);
						this_.map.removeLayer(marker);							
						delete markers[kk];
					}				
				});
			};
			var get_geo_values = function(pathables) {
				return utils.flatten(pathables.map(
					function(pathable) {
						return pathable.get_last_value().map(function(val) {
							var geo = this_.get_lat_lng(val);
							if (defined(geo)) {	return { model: pathable, val: val, geo: geo };	}
						}).filter(defined);
					}));
			};

			var updateLatLng = function(op) {
				return function(old, position) {
					if (old === undefined) return position;
					return new L.LatLng( op(old.lat, position.lat), op(old.lng, position.lng) );
				};
			},
			updateMaxLatLng = updateLatLng(Math.max),
			updateMinLatLng = updateLatLng(Math.min);
			var within_bounds = function(point, boundingbox) {
				var minll = boundingbox.getSouthWest(), maxll = boundingbox.getNorthEast();
				return point.lat >= minll.lat && point.lat <= maxll.lat &&
					point.lng >= minll.lng && point.lng <= maxll.lng;
			};
			var enlargeBounds = function(point,boundingbox) {
				var minll = boundingbox.getSouthWest(), maxll = boundingbox.getNorthEast();
				return new L.LatLngBounds(
					new L.LatLng(Math.min(point.lat, minll.lat),Math.min(point.lng, minll.lng)),
					new L.LatLng(Math.max(point.lat, maxll.lat),Math.max(point.lng, maxll.lng))
				);									
			};			
			var geovaltoLatLng = function(geoval) {
				return new L.LatLng(geoval.geo.lat,geoval.geo.long);
			};
			var last_position;
			var minLatLng, maxLatLng;
			// make some markers for each of the dropzone_boxes!
			zones.map(function(i) {
				var box = defined(this_.dropzone_boxes[i]) ? this_.dropzone_boxes[i].pathables : [];
				var markers = this_.markers_by_box[i] ? this_.markers_by_box[i] : [];
				var geovalues = get_geo_values(box);
				_(geovalues).each(function(geoval, vi) {
					var position = geovaltoLatLng(geoval);
					minLatLng = updateMinLatLng(minLatLng, position);
					maxLatLng = updateMaxLatLng(maxLatLng, position);
					if (!defined(markers[vi])) {
						markers[vi] = (new L.Marker(position, {icon:this_.marker_icons[i]}));
						markers[vi].addTo(this_.map)
							.on('mouseover', function() {
								var gv = this.geoval;
								this_._trigger_brush_event('brush_visual', gv.model);
							})
							.on('mouseout', function() {
								var gv = this.geoval;
								this_._trigger_brush_event('unbrush_visual', gv.model);
							});
						markers[vi].bindPopup(this_._make_popup_text(geoval.model, geoval.val));
						markers[vi].geoval = geoval;
					} else {
						markers[vi].setLatLng(position);
						markers[vi].bindPopup(this_._make_popup_text(geoval.model, geoval.val));
						markers[vi].geoval = geoval;						
					}
					markers[vi].setOpacity(this_.brushed.length == 0 || this_.brushed.indexOf(geoval.model) >= 0 ? 1.0 : 0.3);
					markers[vi].update();
					last_position = position;
				});
				// exit selection
				if (markers.slice(geovalues.length).length > 0) {
					console.log('for zone ', i, 'setting markers' , markers.slice(geovalues.length).length);
					remove_markers(markers.slice(geovalues.length));
				}
				this_.markers_by_box[i] = markers.slice(0,geovalues.length);
			});
			var focus_point = this.brushed.length > 0 && get_geo_values(this.brushed).length ?
				geovaltoLatLng(get_geo_values(this.brushed)[0]) :
				last_position;
			
			if (defined(focus_point) && !within_bounds(focus_point, this.map.getBounds())) {
				// this.map.fitBounds(enlargeBounds(focus_point, this.map.getBounds()));
				// this.map.fitBounds(new L.LatLngBounds(minLatLng, maxLatLng));
				var bz = this.map.getBoundsZoom( new L.LatLngBounds(minLatLng, maxLatLng) );
				console.log("BOUNDS ZOOM ", bz);
				console.log('pan to ', (maxLatLng.lat + minLatLng.lat) / 2.0, (maxLatLng.lng + minLatLng.lng) / 2.0);
				this.map.panTo( new L.LatLng( (maxLatLng.lat + minLatLng.lat) / 2.0, (maxLatLng.lng + minLatLng.lng) / 2.0) );
				this.map.setZoom(bz);
				// this.map.panInsideBounds(new L.LatLngBounds(minLatLng, maxLatLng));
			}
			
			return this;
		},
		_get_class_for_dropzone:function(i) {
			return 'dropzone-'+i;
		},
		_setDropzoneBox:function(box, dropzone_i) {
			var dropzone_class = this._get_class_for_dropzone(dropzone_i);			
			var this_ = this;
			box.on('delete', function() {
				this_.setDropzoneBox(undefined, dropzone_i);
			}, this);
			box.pathables
				.on('add remove', function(eventType) {
					console.log('add remove update ');
					this_.update();
				}, this)
				.on_model('brush_visual', function(pathable) {
					this_._brush_pathable(pathable);
				}, this)
				.on_model('unbrush_visual', function(pathable) {
					this_._unbrush_pathable(pathable);
				}, this);
			box.$el.addClass(dropzone_class);
		},
		_unsetDropzoneBox:function(oldbox, dropzone_i) {
			var dropzone_class = this._get_class_for_dropzone(dropzone_i);
			console.log("UNSETDROPZONEBOX ", oldbox, dropzone_i, dropzone_class);
			oldbox.$el.removeClass(dropzone_class);
			oldbox.pathables.off(null, null, this);
			oldbox.off(null,null,this);
		},
		setDropzoneBox:function(box, dropzone_i) {
			console.log('setDropzoneBox ', box, dropzone_i);
			var this_ = this;
			if (defined(this.dropzone_boxes[dropzone_i])) {
				this._unsetDropzoneBox(this.dropzone_boxes[dropzone_i], dropzone_i);
				delete this.dropzone_boxes[dropzone_i];
			}
			_(this.dropzone_boxes).keys()
				.map(function(key_i) {
					var dzbox = this_.dropzone_boxes[key_i];
					if (defined(dzbox) && dzbox == box) {
						this_._unsetDropzoneBox(dzbox, key_i);
						delete this_.dropzone_boxes[key_i];						
					}
				});			
			this.dropzone_boxes[dropzone_i] = box;			
			if (defined(box)) {	this._setDropzoneBox(box, dropzone_i);	}
			this_.update();							
		},
		_cb_delete:function() {
			var this_ = this;
			zones.map(function(x) { this_.setDropzoneBox(null,x); });
			this.trigger('delete');
			this.$el.remove();
		},
		_brush_pathable:function(pathable) {
			// incoming brush from the view -> 
			this.brushed.push(pathable);
			this.update();
		},
		_unbrush_pathable:function(pathable) {
			// incoming unbrush from the view
			this.brushed = _(this.brushed).without(pathable);
			this.update();
		},
		_trigger_brush_event:function(eventType, pathable) {
			pathable.model.trigger(eventType);
		},
		_cb_raise:function() { this.trigger('raise'); }
	});

	return { MapVisual: MapVisual };

});
