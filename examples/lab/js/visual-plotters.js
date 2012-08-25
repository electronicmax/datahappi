define(['js/utils'], function(utils) {
	
	var SeriesBarPlotter = Backbone.View.extend({
		render:function(data) {
			// this.$el is bound to svg
			var this_ = this, height = this.$el.height();
			var spacing = 2;
			var barwidth = (this.$el.find('svg').width() / data.length) - spacing;
			var max_val = d3.max(data.map(function(x) { return x[2]; }));
			var yscale = d3.scale.linear().domain([0,max_val]).range([0,height]);
			var svg_p = d3.select(this.$el[0]);
			
			// enter selection
			svg_p
				.selectAll('rect')
				.data(data) ///// , function(d) { return d.series_d; })
				.enter()
				.append('rect')
				.attr('data-pathable', function(d) { return d.series_pathable.id; })
				.attr('data-val', function(d) { return d.series_val.id || d.series_val.valueOf && d.series_val.valueOf() || '??'; })
				.on('mouseover', function(d) { this_._brush_value(d.series_pathable); })
				.on('mouseout', function(d) { this_._unbrush_value(d.series_pathable); });

			// update selection
			svg_p
				.selectAll('rect')
				.data(data)
				.attr('y', function(d,i) { return height - yscale(d.numeric); })
				.attr('x', function(d,i) { return i*(barwidth); })
				.attr('height', function(d) { return yscale(d.numeric); })
				.attr('width', barwidth);

			// exit selection
			svg_p
				.selectAll('rect')
				.data(data)
				.exit().remove();
			
			return this;
		}
	});
	
	return {
		SeriesBarPlotter:SeriesBarPlotter
	};
});
