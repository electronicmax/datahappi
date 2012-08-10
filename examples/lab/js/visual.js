define([], function() {
	
	// histogram widget using d3
	var Visual = Backbone.View.extend({
		className:'visual',
		tagName:'div',
		template:'<div class="box-delete icon-cancel"></div><div class="uplt"></div><div class="uprt"></div><div class="btlt"></div><div class="btrt"></div><div class="items"></div><div class="yaxis"></div><div class="xaxis"></div><svg class="plot"></svg>',
		events : {
			'click .box-delete' : '_cb_delete'
		},										 
		initialize:function() {
			if (this.options.series) { this.setSeries(this.options.series); }
			if (this.options.data) { this.setData(this.options.data); }
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
			if (this.options.data) {
				this.options.data.off(null, null, this);
			}
			var this_ = this;
			this.options.data = s;
			this.options.data.on('all', function() { this_._update_plot(); }, this);
		},		
		_brush_value:function(d) {s
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
		_plot_series:function(svg_p, series_pathables) {
			var data = this._get_counts(pathables);
			var barwidth = 5;
			var height = 20;
			var this_ = this;
			var yscale = d3.scale.linear()
				.domain([0, d3.max(data.map(function(x) { return x[1]; }))])
				.range([0,height]);
			// enter
			svg_p
				.selectAll('rect')
				.data(data, function(d) { return d[0]; })
				.enter()
				.append('rect')
				.on('mouseover', function(d) { this_._brush_value(d[0]); })
				.on('mouseout', function(d) { this_._unbrush_value(d[0]); });

			// update
			svg_p
				.selectAll('rect')
				.data(data, function(d) { return d[0]; })			
				.attr('y', function(d,i) { console.log('yscale ', yscale(d[1])); return height - yscale(d[1]); })
				.attr('x', function(d,i) { return i*barwidth; })
				.attr('height', function(d) { return yscale(d[1]); })
				.attr('width', barwidth)
				.attr('data-val', function(d) { return d[0]; });

			// exit
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
			if (this.options.series === undefined) {
				this.
			}
		},
		render:function() {
			var this_ = this;
			this.$el.html(this.template);
			this.$el.draggable({ drag:function(evt,ui) { this_.trigger('drag', ui.offset); }});			
			this.$el.find('.yaxis').droppable({
				greedy:true,  accept:'.greybox', tolerance:"touch",
				over:function(event, ui) { $(this).addClass("over"); },
				out:function(event, ui) { $(this).removeClass("over"); 	},
				drop: function( event, ui ) {
					$(this).removeClass("over");
					var view = ui.draggable.data("view");
					console.log('setting data ');
					// todo some sort of feedback
					this_.setData(view.pathables);
				}
			});			
			this.$el.find('.xaxis').droppable({
				greedy:true,
				accept:'.greybox'
				tolerance:"touch",
				over:function(event, ui) {
					$(this).addClass("over");
				},
				out:function(event, ui) {
					$(this).removeClass("over");
				},
				drop: function( event, ui ) {
					$(this).removeClass("over");
						var v = box.clone_view(ui.draggable.data("view"));
					this_.add(v);
					this_._render_view(v);
				}				
			});			
			this._update_plot();			
		},		
		_get_counts:function(pathables) {
			var to_raw_value = function(x) {
				if (x instanceof Backbone.Model) {	return x.id;}
				if (x.valueOf) { return x.valueOf(); }
				return x;
			};
			var values = pathables.map(function(p) { return p.get_last_value()[0]; });
			var raws = values.map(to_raw_value);
			var uniqs = _.uniq(raws);			
			return uniqs.sort().map(function(val) {
				return [val, raws.filter(function(raw) { return val == raw; }).length];
			});
		},
	});
	return { Visual: Visual };
});


