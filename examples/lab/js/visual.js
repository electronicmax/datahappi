define([], function() {

	var to_raw_value = function(x) {
		if (x instanceof Backbone.Model) { return x.id; }
		if (x.valueOf) { return x.valueOf(); }
		return x;
	};
	
	// histogram widget using d3
	var Visual = Backbone.View.extend({
		className:'visual',
		tagName:'div',
		template:'<div class="delete icon-cancel"></div><div class="uplt"></div><div class="uprt"></div><div class="btlt"></div><div class="btrt"></div><div class="yaxis"><span class="lbl"><i>(drag here to set data)</i></span></div><div class="xaxis"><span class="lbl"><i>(drag here to set series)</i></span></div><svg class="plot"></svg>',
		events : {
			'click .delete' : '_cb_delete'
		},										 
		initialize:function() {
			if (this.options.series) { this.setSeries(this.options.series); }
			if (this.options.views) { this.setData(this.options.views); }
		},
		setSeries:function(s) {
			if (this.options.series) {
				this.options.series.off(null, null, this);
			}
			var this_ = this;
			this.options.series = s;
			this.options.series.on('all', function() { this_._update_plot(); }, this);
		},
		setData:function(s) {
			if (this.options.views) {
				this.options.views.off(null, null, this);
			}
			var this_ = this;
			this.options.views = s;
			this.options.views.on('all', function(eventType) {
				console.log('got an event ', eventType, " updating plot ");
				this_._update_plot();
			}, this);
			this_._update_plot();
		},		
		_brush_value:function(d) {
			this.trigger('brush', d);
			this.$el.find('rect').each(function() {
				var $t = $(this);
				if ($t.attr('data-val') == d) {
					$t.attr('class', 'brush');
				} else {
					$t.attr('class', 'unbrush');
				}
			});
		},
		_unbrush_value:function(d) {
			this.trigger('unbrush', d);
			this.$el.find('rect').each(function() {
				var $t = $(this);
				$t.attr('class', '');
			});
		},		
		_hist_series:function(svg_p, series_pathables, max_count) {
			var this_ = this, height = this.$el.find('svg').height();
			var data = this._get_counts(series_pathables);
			var spacing = 2;
			var barwidth = (this.$el.find('svg').width() / data.length) - spacing;
			var yscale = d3.scale.linear()
				.domain([0,max_count])
				.range([0,height]);
			
			// enter selection
			svg_p
				.selectAll('rect')
				.data(data, function(d) { return d[0]; })
				.enter()
				.append('rect')
				.on('mouseover', function(d) { this_._brush_value(d[0]); })
				.on('mouseout', function(d) { this_._unbrush_value(d[0]); });

			// update selection
			svg_p
				.selectAll('rect')
				.data(data, function(d) { return d[0]; })			
				.attr('y', function(d,i) { return height - yscale(d[1]); })
				.attr('x', function(d,i) { return i*(barwidth); })
				.attr('height', function(d) { return yscale(d[1]); })
				.attr('width', barwidth)
				.attr('data-val', function(d) { return d[0]; });

			// exit selection
			svg_p
				.selectAll('rect')
				.data(data, function(d) { return d[0]; })			
				.exit().remove();
			
			return this;
		},		
		_cb_delete:function() {
			this.$el.fadeOut();
		},
		_update_plot:function() {
			var plot = d3.select('.plot');			
			if (this.options.views === undefined) {
				d3.selectAll('text')
					.data([0])
					.enter()
					.append('svg:text')
					.attr('x', 30)
					.attr('y', 50)
					.attr('text-anchor','middle')
					.text(' no data enabled ');
				return;
			} else {
				d3.selectAll('text').remove();
			};
			var max_count = d3.max(this._get_counts(this.options.views).map(function(x) { return x[1]; }));
			if (this.options.series === undefined) {
				console.log('no series defined, plotting as one >> ', plot, this.options.views, max_count);
				this._hist_series(plot, this.options.views, max_count);
			} else {
				// subdivide into groups based upon the series dataset
				// var pathables_by_series = {};
				throw new Error('pathables by series not implemented');
			}
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
				greedy:true,
				accept:'.greybox',
				tolerance:"touch",
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
			console.log(' update plot >> ');
			return this;
		},		
		_get_counts:function(views) {
			var pathables = views.map(function(x) { return x.options.model ; });
			var values = pathables.map(function(p) { return p.get_last_value()[0]; });
			var raws = values.map(to_raw_value);
			var uniqs = _.uniq(raws);			
			return uniqs.sort().map(function(val) {
				return [val, raws.filter(function(raw) { return val == raw; }).length];
			});
		}
	});
	return { Visual: Visual };
});


