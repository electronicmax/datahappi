define(['js/models', 'js/utils'], function(models, utils) {

	var defined = utils.DEFINED;
	
	var MapVisual = Backbone.View.extend({
		apiKey:	'285675b50972436798d67ce55ab7ddde',
		className:'visual-map',
		tagName:'div',
		template:'<div class="delete icon-cancel"></div><div class="uplt"></div><div class="uprt"></div><div class="btlt"></div><div class="btrt"></div><div class="dropzones"></div><div class="map-zone"></div><div class="warnings"></div>',
		events : {
			'click .delete' : '_cb_delete'
		},
		defaults : { center:[51.505, -0.09], zoom:13 },
		initialize:function() {
			this.options = _.extend(this.defaults, this.options);
			this.dropzone_boxes = [];
			this.dataset_markers = [];
		},
		render:function() {
			var this_ = this;
			this.$el.html(this.template);
			this.$el.draggable({
				handle:this.$el.find('.dropzones'),
				drag:function(evt,ui) { this_.trigger('drag', ui.offset); }
			});
			this.$el.css('top', 50 + 100*Math.random());
			this.$el.css('left', 50 + 100*Math.random());
			this.$el.data('view', this);
			var dropzone = "<div class='dropzone'><div class='lbl'>drop here</div></div>";
			[1,2,3,4].map(function(i) {
				$(dropzone).addClass('dropzone-'+i).appendTo(this_.$el.find('.dropzones'));
			});
			this.$el.find('.dropzone').droppable({
				greedy:true,  accept:'.greybox', tolerance:"pointer",
				over:function(event, ui) {
					$(this).addClass("over");
					$(this).find('.lbl').html('ok!'); 
				},
				out:function(event, ui) {
					$(this).removeClass("over");
					$(this).find('.lbl').html('drop here');
				},
				drop: function( event, ui ) {
					var view = ui.draggable.data("view");
					var views = view.views_collection;
					var dropzone_i = this_.$el.find('.dropzone').index($(this));
					$(this).removeClass("over");
					$(this).find('.lbl').html('' + views.length + 'items');
					this_.setDropzoneBox(view, dropzone_i);
				}
			});						
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

			if (_(this.map).isUndefined()) { console.log('map is undefined :( '); return; }
			
			var last_position;
			// make some markers for each of the dropzone_boxes!
			_(this.dropzone_boxes).each(function(box, i) {
				// for each data set
				var dataset = box.pathables;
				var markers_by_model = this_.dataset_markers[i] || [];	// [ [model_x_markers], [model_x2_markers], ... ]

				dataset.each(function(model, j) {
					var model_markers = markers_by_model[j] || [];
					markers_by_model[j] = model_markers;
					
					model.get_last_value().map(function(val, k) {
						var geoval = this_.get_lat_lng(val);
						if (_(geoval).isUndefined()) {
							if  (!_.isUndefined(model_markers[k])) {
								this_.map.removeLayer(model_markers[k]);								
								delete model_markers[k];
							}
							return;
						}
						console.log("geo val is not undefined ", geoval);
						var position = new L.LatLng(geoval.lat,geoval.long);
						if (defined(model_markers[k])) {
							model_markers[k].setLatLng(position);
							model_markers[k].bindPopup(this_._make_popup_text(model, val));
							model_markers[k].update();
						} else {
							model_markers[k] = (new L.Marker(position));
							model_markers[k].addTo(this_.map);
							model_markers[k].bindPopup(this_._make_popup_text(model, val));
						}
						last_position = position;
					});

					// exit selection per _value_
					_(model_markers.slice(model.get_last_value().length))
						.each(function(marker, kk) {
							if (defined(marker)) {
								this_.map.removeLayer(marker); 
								delete model_markers[kk];
							}								
						});
				});
				
				// exit selection per model
				markers_by_model.slice(dataset.length).map(function(model_markers) {
					_(model_markers).each(function(marker, kk) {
						if (defined(marker)) {
							this_.map.removeLayer(marker);							
							delete model_markers[kk];
						}				
					});
				});
				this_.dataset_markers[i] = markers_by_model;
			});
			if (!_(last_position).isUndefined()) { this.map.panTo(last_position); }
			return this;
		},
		_get_class_for_dropzone:function(i) {
			return 'dropzone_'+i;
		},
		setDropzoneBox:function(box, dropzone_i) {
			var this_ = this, dropzone_class = this._get_class_for_dropzone(dropzone_i);
			if (this.dropzone_boxes[dropzone_i]) {
				// break previous dropzone box
				this.dropzone_boxes.$el.removeClass(dropzone_class);
				this.dropzone_boxes[dropzone_i].pathables.off(null, null, this);
				this.dropzone_boxes.off(null,null,this);				
			}
			if (defined(box)) {
				this.dropzone_boxes[dropzone_i] = box;
				box.on('delete', function() { this_._setDropzoneBox(null, dropzone_i); }, this);
				box.pathables.on('all', function(eventType) { this_.update(); }, this);
				box.$el.addClass(dropzone_class);
				this_.update();
			}
		},
		_cb_delete:function() {
			this.trigger('delete');
			this.$el.remove();
		}
	});

	return { MapVisual: MapVisual };

});
