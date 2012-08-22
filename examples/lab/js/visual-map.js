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
			this.datasets = [];
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
 			[1,2,3,4].map(function(i) { this_.$el.find('.dropzones').append(dropzone);});
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
					$(this).removeClass("over");
					$(this).find('.lbl').html('' + views.length + 'items');
					this_.setData(view.pathables, this_.$el.find('.dropzone').index($(this)));
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
				if (defined(val.get('lat')) && val.get('lat').length
					&& defined(val.get('long')) && val.get('long').length) {
					return { lat: val.get('lat')[0], long: val.get('long')[0] };
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
			// make some markers for each of the datasets!
			_(this.datasets).each(function(dataset, i) {
				// for each data set
				console.log("DATASET > ", dataset);
				var markers = this_.dataset_markers[i] || [];
				dataset.each(function(model, j) {
					console.log("MODEL > ", model);					
					var model_markers = markers[j] || [];
					markers[j] = model_markers;					
					model.get_last_value().map(function(val, k) {
						console.log("val > ", val);											
						var geoval = this_.get_lat_lng(val);
						if (_(geoval).isUndefined()) {
							if  (!_.isUndefined(model_markers[k])) {
								model_markers[k].removeFrom(this_.map);
								delete model_markers[k];
							}
							return;
						}
						console.log("geo val is not undefined ", geoval);
						var position = new L.LatLng(geoval.lat,geoval.long);
						if (defined(model_markers[k])) {
							model_markers[k].setLatLng(position);
							model_markers[k].bindPopup(this_._make_popup_text(model, val)).update();
						} else {
							model_markers[k] = (new L.Marker(position))
								.bindPopup(this_._make_popup_text(model, val))
								.addTo(this_.map);
						}
						last_position = position;
					});
				});
				this_.dataset_markers[i] = markers;
			});
			if (!_(last_position).isUndefined()) { this.map.panTo(last_position); }
			return this;
		},
		setData:function(s, dropzone_i) {
			console.log("SETTING data for dropzone ", dropzone_i, s);
			var this_ = this;
			if (this.datasets[dropzone_i]) {
				this.datasets[dropzone_i].off(null, null, this);
			}			
			this.datasets[dropzone_i] = s;
			s.on('all', function(eventType) { this_.update(); }, this);
			this_.update();
		},
		_cb_delete:function() {
			this.trigger('delete');
			this.$el.remove();
		}
	});

	return { MapVisual: MapVisual };

});
