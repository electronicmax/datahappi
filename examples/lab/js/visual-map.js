define(['js/utils'], function(utils) {
	
	var MapVisual = Backbone.View.extend({
		apiKey:	'285675b50972436798d67ce55ab7ddde',
		className:'visual-map',
		tagName:'div',
		template:'<div class="delete icon-cancel"></div><div class="uplt"></div><div class="uprt"></div><div class="btlt"></div><div class="btrt"></div><div class="dropzones"></div><div class="map-zone"></div>',
		events : {
			'click .delete' : '_cb_delete'
		},
		defaults : { center:[51.505, -0.09], zoom:13 },
		initialize:function() {
			this.options = _.extend(this.defaults, this.options);
			this.datasets = [];			
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
			var dropzone = "<div class='dropzone'></div>";
 			[1,2,3,4].map(function(i) { this_.$el.find('.dropzones').append(dropzone);});
			this.$el.find('.dropzone').droppable({
				greedy:true,  accept:'.item,.pathable-view', tolerance:"pointer",
				over:function(event, ui) {
					$(this).addClass("over");
					$(this).find('.lbl').html('set as series'); 
				},
				out:function(event, ui) {
					$(this).removeClass("over");
					$(this).find('.lbl').html('drop data here');
				},
				drop: function( event, ui ) {
					var view = ui.draggable.data("view");
					var views = view.views_collection;
					$(this).removeClass("over");
					$(this).find('.lbl').html('' + views.length + 'items');
					this_.setData(views, this_.$el.find('.dropzone').index($(this)));
				}
			});						
			return this;
		},
		update:function() {
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
			return this;
		},
		setData:function(s, dropzone_i) {
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
