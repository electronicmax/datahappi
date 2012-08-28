define(['examples/lab/js/visual-engine','examples/lab/js/visual-plotters',	'js/utils'], function(engines, plotters, utils) {

	var defined = utils.DEFINED, assert = utils.assert;
	var VisualBase = Backbone.View.extend({});
	
	// histogram widget using d3
	var Visual = VisualBase.extend({
		className:'visual',
		tagName:'div',
		template:'<div class="delete icon-cancel"></div><div class="uplt"></div><div class="uprt"></div><div class="btlt"></div><div class="btrt"></div><div class="xaxis"><span class="lbl"><i>(drag here to set series)</i></span></div><svg class="plot"></svg>',
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
			if (this.options.series) { this.setSeries(this.options.series); }
			if (this.options.views) { this.setData(this.options.views); }
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
		setData:function(s) {
			console.log('setting views  ', s);
			if (this.options.views) {
				this.options.views.off(null, null, this);
			}
			var this_ = this;
			this.options.views = s;
			if (defined(this.options.views)) {
				this.options.views.on('all', function(eventType) { this_._update_plot(); }, this);
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
			
			if (!(defined(this.options.views))) {
				plot.selectAll('text').data([1]).enter()
					.append('text')
					.attr('x', 30).attr('y',50)				
					.text('drag some data in my zones');				
				return;
			}
			d3.selectAll('text').remove();
			
			if (!defined(this.options.plotter) && defined(this.options.plotter_class)) {
				this.options.plotter = new this.options.plotter_class({el:plot[0]});
				this.options.plotter.on('all', function(brushtype, pathable_combo) {
					this_.options.views.trigger(brushtype, pathable_combo.pathables);
				}, this);
			}
			var models = this.options.views.map(function(view) { return view.options.model; });
			var engine = this.options.engines.filter(function(engine) { return engine.test(models) });
			if (engine.length > 0) {
				console.log("Using engine ", engine[0].id);
				var data = engine[0].generate_data(
					this.options.views.map(function(x) { return x.options.model; }),
					defined(this.options.series) ? this.options.series.map(function(x) { return x.options.model; }) : []
				);
				console.log(" data >> ", data);
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
					var views = ui.draggable.data("views")();
					this_.$el.removeClass("over");
					this_.setData( views );
				}
			});			
			this.$el.find('.xaxis').droppable({
				greedy:true, accept:'.greybox',	tolerance:"touch",
				over:function(event, ui) {
					$(this).addClass("over");
					old_x_label = $(this).find('label').html();
					$(this).find('.lbl').html('set as series');
				},
				out:function(event, ui) {
					$(this).removeClass("over");
					$(this).find('.lbl').html(old_x_label);					
				},
				drop: function( event, ui ) {
					$(this).removeClass("over");					
					this_.setSeries( ui.draggable.data("views")() );	
				}				
			});
			return this;
		}
	});
	return {
		Visual: Visual,
		VisualBase:VisualBase
	};
});


