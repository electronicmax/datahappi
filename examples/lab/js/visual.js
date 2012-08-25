define(['examples/lab/js/visual-engine','examples/lab/js/visual-plotters',	'js/utils'], function(engines, plotters, utils) {

	var defined = utils.DEFINED;
	var VisualBase = Backbone.View.extend({});
	
	// histogram widget using d3
	var Visual = VisualBase.extend({
		className:'visual',
		tagName:'div',
		template:'<div class="delete icon-cancel"></div><div class="uplt"></div><div class="uprt"></div><div class="btlt"></div><div class="btrt"></div><div class="yaxis"><span class="lbl"><i>(drag here to set data)</i></span></div><div class="xaxis"><span class="lbl"><i>(drag here to set series)</i></span></div><svg class="plot"></svg>',
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
			if (!defined(this.options.engine)) { this.options.engine = this.options.engines[0]; }
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
		reset_engine_and_potter:function() {
			if (defined(this.options.plotter)) { this.options.plotter.off('all', null, this); }
			if (defined(this.options.engine)) { this.options.engine.off('all', null, this); }			
			delete this.options.engine;
			delete this.options.plotter;
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
					this_.options.views.trigger(brushtype, pathable_combo.pathable);
				}, this);
			}
			
			var data =	this.options.engine.generate_data(
				this.options.views.map(function(x) { return x.options.model; }),
				defined(this.options.series) ? this.options.series.map(function(x) { return x.options.model; }) : []
			);

			this.options.plotter.render(data);
		},
		render:function() {
			var this_ = this;
			var old_y_label = '', old_x_label = '';
			this.$el.html(this.template);
			this.$el.draggable({ drag:function(evt,ui) { this_.trigger('drag', ui.offset); }});			
			this.$el.find('.yaxis').droppable({
				greedy:true,  accept:'.greybox', tolerance:"touch",
				over:function(event, ui) {
					$(this).addClass("over");
					old_y_label = $(this).find('lbl').html();
					$(this).find('.lbl').html('display values'); 
				},
				out:function(event, ui) {
					$(this).removeClass("over");
					$(this).find('.lbl').html(old_y_label);
				},
				drop: function( event, ui ) {
					var view = ui.draggable.data("view");
					var views = view.views_collection;
					$(this).removeClass("over");
					$(this).find('.lbl').html('selected ' + views.length);
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
					var view = ui.draggable.data("view");
					var laststep = view.pathables.paths.at(0).get_last_step();
					$(this).removeClass("over");
					$(this).find('.lbl').html('grouped by '+ laststep.valueOf());
					this_.setSeries(view.view_collection);					
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


