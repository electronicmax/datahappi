define(['examples/lab/js/visual-engine','examples/lab/js/visual-plotters',	'js/utils'], function(engines, plotters, utils) {

	var defined = utils.DEFINED, assert = utils.assert;
	var VisualBase = Backbone.View.extend({});
	
	// histogram widget using d3
	var Visual = VisualBase.extend({
		className:'visual',
		tagName:'div',
		template:'<div class="titlebar">Plot<div class="delete icon-cancel"></div></div><div class="xaxis"><span class="lbl"><i>(drag here to set series)</i></span></div><svg class="plot"></svg>',
		events : {
			'click .delete' : '_cb_delete',
			'click .titlebar' : '_cb_raise'
		},
		defaults : {
			engines : _(engines).values(),
			plotters : _(plotters).value(),
			plotter_class: plotters.SeriesBarPlotter,
			engine_class: engines.BarValues
		},
		initialize:function() {
			this.options = _({}).chain().extend(this.defaults).extend(this.options).value();
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
		setData:function(view) {
			var this_ = this;
			var oldview = this.options.view
			if (defined(oldview)) {
				oldview.pathables.off_model(null, this);
				oldview.pathables.off(null, null, this);
				oldview.$el.removeClass('plotting');
				oldview.off(null, null, this);
			}
			this.options.view = view;
			if (defined(view)) {
				view.$el.addClass('plotting');
				view.pathables.on_model('all', function(pathable, eventType) {
					if (eventType == 'brush_visual') { this_._handle_brush_pathable(pathable);	}
					if (eventType == 'unbrush_visual') { this_._handle_unbrush_pathable();	} 					
					this_._update_plot();
				}, this);
				view.pathables.on('add remove', function() { this_._update_plot(); });
				view.on('delete', function() {
					console.log('got a destruct event on associated box >>>>>>>>>>>>>>>>>> ');
					this_.setData(undefined);
				});				
			}
			this_._update_plot();
		},
		_cb_delete:function() {
			var this_ = this;
			this.setData(undefined);
			if (defined(this.options.plotter)) { this.options.plotter.off(null, null, this);}
			this.$el.fadeOut(function() { this_.$el.remove(); });
			this.$el.remove();
		},
		_update_plot:function() {
			var this_ = this;
			if (!defined(this.options.plotter)) { return ; }
			if (!(defined(this.options.view))) {
				this.options.plotter.render([]);
				return;
			}			
			var models = this.options.view.pathables;
			var engine = this.options.engines.filter(function(engine) { return engine.test(models) });
			if (engine.length > 0) {
				var data = engine[0].generate_data(models); // , defined(this.options.series) ? this.options.series.map(function(x) { return x.options.model; }) : []
				if (defined(this_.brush)) {
					data.map(function(datum) {	datum.brush = (datum.series_pathables.indexOf(this_.brush) >= 0); 	});
				}
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
					this_.$el.removeClass("over");
					this_.setData( view );

					// position in back 
					var start_pos = ui.draggable.data("drag_start_position");
					ui.draggable.data("view").setTopLeft(start_pos.top, start_pos.left, true);					
				}
			});
			this.$el.resizable({ resize: function() { this_._update_plot(); 	} });
			this.$el.data('view', this);
			if (defined(this.options.plotter)) { this.options.plotter.off(null, null, this); }
			var plot = d3.selectAll(this.$el.find('svg.plot'));			
			this.options.plotter = new this.options.plotter_class({el:plot[0]});
			this.options.plotter.on('all',
									function(event_name, pathables) {
										if (['brush_visual', 'unbrush_visual'].indexOf(event_name) < 0) { return; }
										pathables.map(function(p) {	p.model.trigger(event_name); });
									}, this);
			
			return this;
		},
		_cb_raise:function(){ this.trigger('raise');}
	});
	return {
		Visual: Visual,
		VisualBase:VisualBase
	};
});


