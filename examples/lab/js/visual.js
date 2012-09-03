define(['examples/lab/js/visual-engine','examples/lab/js/visual-plotters',	'js/utils'], function(engines, plotters, utils) {

	var defined = utils.DEFINED, assert = utils.assert;
	var VisualBase = Backbone.View.extend({});
	
	// histogram widget using d3
	var Visual = VisualBase.extend({
		className:'visual',
		tagName:'div',
		template:'<div class="titlebar">Plot<div class="delete icon-cancel"></div></div><div class="xaxis"><span class="lbl"><i>(drag here to set series)</i></span></div><svg class="plot"></svg>',
		events : {
			'click .delete' : '_cb_delete'
		},
		defaults : {
			engines : _(engines).values(),
			plotters : _(plotters).value(),
			plotter_class: plotters.SeriesBarPlotter,
			engine_class: engines.BarValues
		},
		initialize:function() {
			this.options = _(this.defaults).extend(this.options);
			if (this.options.models) { this.setData(this.options.models); }
		},
		setSeries:function(s) {
			var this_ = this;
			if (defined(this.options.series)) {
				this.options.series.off(null, null, this);
			}
			this.options.series = s;
			if (defined(this.options.series)) {
				this.options.series.on('all', function() { this_._update_plot(); }, this);
			}
		},
		_handle_brush_pathable:function(pathable) {
			this.brush = pathable;
		},
		_handle_unbrush_pathable:function() {
			delete this.brush;
		},
		setData:function(s) {
			var this_ = this;			
			if (this.options.models) {
				this.options.models.off_model(null, this);
			}
			this.options.models = s;
			if (defined(this.options.models)) {
				this.options.models.on_model('all', function(pathable, eventType) {
					if (eventType == 'brush_visual') { this_._handle_brush_pathable(pathable);	}
					if (eventType == 'unbrush_visual') { this_._handle_unbrush_pathable();	} 					
					this_._update_plot();
				}, this);
			}
			this_._update_plot();
		},
		_cb_delete:function() {
			var this_ = this;
			this.setData(undefined);
			this.$el.fadeOut(function() { this_.$el.remove(); });
		},
		_update_plot:function() {
			var this_ = this;
			var plot = d3.select(this.el).select('svg.plot');
			
			if (!(defined(this.options.models))) {
				if (defined(this.options.plotter)) {
					this.options.plotter.render([]);
				}
				return;
			}
			d3.selectAll('text').remove();			
			if (!defined(this.options.plotter) && defined(this.options.plotter_class)) {
				this.options.plotter = new this.options.plotter_class({el:plot[0]});
				this.options.plotter.on('all',
										function(event_name, pathables) {
											console.log('plotter ', event_name, pathables);
											if (['brush_visual', 'unbrush_visual'].indexOf(event_name) < 0) { return; }
											console.log('pathables > ', pathables);
											pathables.map(function(p) {	p.model.trigger(event_name); });
										}, this);
			}
			var models = this.options.models;
			var engine = this.options.engines.filter(function(engine) { return engine.test(models) });
			if (engine.length > 0) {
				var data = engine[0].generate_data(
					this.options.models,
					defined(this.options.series) ? this.options.series.map(function(x) { return x.options.model; }) : []
				);
				if (defined(this_.brush)) {
					data.map(function(datum) {
						datum.brush = (datum.series_pathables.indexOf(this_.brush) >= 0); 
					});
				}
				console.log('render data ', data);
				this.options.plotter.render(data);
			} else {
				assert(false, "Could not find suitable engine ");
			}			

		},
		render:function() {
			var this_ = this;
			var old_y_label = '', old_x_label = '';
			this.$el.html(this.template);
			this.$el.draggable({ drag:function(evt,ui) { this_.trigger('drag', ui.offset); }});			
			this.$el.find('.plot').droppable({
				greedy:true,  accept:'.greybox', tolerance:"touch",
				over:function(event, ui) {
					console.log('adding class over', this_.$el);
					this_.$el.addClass("over");
				},
				out:function(event, ui) {
					this_.$el.removeClass("over");
				},
				drop: function( event, ui ) {
					var view = ui.draggable.data('view');
					view.on('delete', function() {
						console.log('got a destruct event on associated box >>>>>>>>>>>>>>>>>> ');
						this_.setData(undefined);
					});
					this_.$el.removeClass("over");
					this_.setData( view.pathables );
				}
			});
			
			// this.$el.find('.xaxis').droppable({
			// 	greedy:true, accept:'.greybox',	tolerance:"touch",
			// 	over:function(event, ui) {
			// 		$(this).addClass("over");
			// 		old_x_label = $(this).find('label').html();
			// 		$(this).find('.lbl').html('set as series');
			// 	},
			// 	out:function(event, ui) {
			// 		$(this).removeClass("over");
			// 		$(this).find('.lbl').html(old_x_label);					
			// 	},
			// 	drop: function( event, ui ) {
			// 		$(this).removeClass("over");					
			// 		this_.setSeries( ui.draggable.data("views")() );	
			// 	}				
			// });
			
			// omg resizing!
			this.$el.resizable({ resize: function() {
				console.log('updating plot');
				this_._update_plot();
			} });
			this.$el.data('view', this);
			return this;
		}
	});
	return {
		Visual: Visual,
		VisualBase:VisualBase
	};
});


