define(['examples/lab/js/visual-engine','examples/lab/js/visual-plotters',	'js/utils'], function(engines, plotters, utils) {

	var to_raw_value = function(v) { return v.valueOf(); };
	var defined = utils.DEFINED;

	var VisualBase = Backbone.View.extend({
		_find_ids_of_pathables_with_raw_value:function(raw_value) {
			var this_ = this;
			if (_(this.options.views).isUndefined()) { return []; }
			return _.uniq(this.options.views.filter(function(V) {
				var m = V.options.model;
				return m.get_last_value().map(to_raw_value).indexOf(raw_value) >= 0;
			}).map(function(x) { return x.options.model.id; }));
		},
		_brush_value:function(raw_value) {
			this.trigger('brush', this._find_ids_of_pathables_with_raw_value(raw_value));			
			this.$el.find('rect').each(function() {
				var $t = $(this);
				if ($t.attr('data-val') == raw_value) {
					$t.attr('class', 'brush');
				} else {
					$t.attr('class', 'unbrush');
				}
			});
		},
		_unbrush_value:function(raw_value) {
			this.trigger('unbrush', this._find_ids_of_pathables_with_raw_value(raw_value));
			this.$el.find('rect').each(function() {
				var $t = $(this);
				$t.attr('class', '');
			});
		},		
		_get_counts:function(views){ 
			var pathables = views.map(function(x) { return x.options.model ; });
			var values = utils.flatten(pathables.map(function(p) { return p.get_last_value(); }));
			var raws = values.map(to_raw_value);
			var uniqs = _.uniq(raws);			
			return uniqs.sort().map(function(val) {
				return [val, raws.filter(function(raw) { return val == raw; }).length];
			});
		}		
	});
	
	// histogram widget using d3
	var Visual = VisualBase.extend({
		className:'visual',
		tagName:'div',
		template:'<div class="delete icon-cancel"></div><div class="uplt"></div><div class="uprt"></div><div class="btlt"></div><div class="btrt"></div><div class="yaxis"><span class="lbl"><i>(drag here to set data)</i></span></div><div class="xaxis"><span class="lbl"><i>(drag here to set series)</i></span></div><svg class="plot"></svg>',
		events : {
			'click .delete' : '_cb_delete'
		},
		defaults : {
			plotter: plotters.SeriesBarPlotter,
			engine: engines.BarValues
		},
		initialize:function() {
			this.options = _(this.defaults).extend(this.options);
			if (this.options.series) { this.setSeries(this.options.series); }
			if (this.options.views) { this.setData(this.options.views); }
		},
		setSeries:function(s) {
			var this_ = this;
			if (this.options.series) {
				this.options.series.off(null, null, this);
			}
			this.options.series = s;
			this.options.series.on('all', function() { this_._update_plot(); }, this);
		},
		setData:function(s) {
			console.log('setting views  ', s);
			if (this.options.views) {
				this.options.views.off(null, null, this);
			}
			var this_ = this;
			this.options.views = s;
			if (defined(this.options.views)) {
				this.options.views.on('all', function(eventType) {	this_._update_plot(); }, this);
			}
			this_._update_plot();
		},
		_cb_delete:function() {
			var this_ = this;
			this.setData(undefined);
			this.$el.fadeOut(function() { this_.$el.remove(); });
		},
		_update_plot:function() {
			var plot = d3.select(this.el).select('svg.plot');
			console.log('this options ', this.options);
			
			if (!(defined(this.options.views) &&
				  defined(this.options.engine) &&
				  defined(this.options.plotter))) {

				plot.selectAll('text').data([1]).enter()
					.append('text')
					.attr('x', 30).attr('y',50)				
					.text('drag some data in my zones');
				
				return;
			}
			console.log('removing text');
			d3.selectAll('text').remove();

			if (this._plotter == undefined) { this._plotter = new this.options.plotter({el:plot[0]});	}
			console.log('plotter',  this._plotter);			
			var data =	this.options.engine.generate_data(
				this.options.views.map(function(x) { return x.options.model }),
				defined(this.options.series) ? this.options.series.map(function(x) { return x.options.model }) : []
			);
			console.log("generated data >> ", data);
			this._plotter.render(data);
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
					this_.setData(	views );
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


