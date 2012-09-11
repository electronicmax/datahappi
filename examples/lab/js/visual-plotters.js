define(['js/utils'], function(utils) {

	var flatten = utils.flatten;
	var defined = utils.DEFINED;
	
	var max_path_length = function(pathables) {
		return _.max( pathables.map(function(x) { return x.path.get('steps').length; }));
	};
	var to_str = function(v) {
		if (_.isNumber(v)) { return v.toFixed(2); }		
		if (v.model && v.model.get_label) { return v.model.get_label(); }
		if (v.get_label) { return v.get_label(); }
		return v.toString();		
	};
	
	var SeriesBarPlotter = Backbone.View.extend({
		initialize:function() {},
		
		render:function(data) {
			// this.$el is bound to svg
			var this_ = this,
				svg_p = d3.select(this.$el[0]),
				height = this.$el.height(),
				bottom_margin = 10,
  				top_margin=40,
  			    side_margins=10,
				width = this.$el.width(),
				spacing = 2,
				barwidth = ( (width - 2*side_margins) / data.length ),
				max_val = d3.max(data.map(function(d) { return d.numeric; })),
				min_val = d3.min(data.map(function(d) { return d.numeric; }).concat([0])),
				yscale = d3.scale.linear().domain([min_val,max_val]).range([0,height - top_margin - bottom_margin]);

			// baseline
			svg_p
				.selectAll('line.baseline')
				.data([0])
				.attr('x1', 0)
				.attr('y1', height - bottom_margin)
				.attr('x2', width)
				.attr('y2', height - bottom_margin)
				.enter()
				.append('line')
				.attr('class', 'baseline');			

			// enter selection
			svg_p
				.selectAll('rect')
				.data(data) ///// , function(d) { return d.series_d; })
				.enter()
				.append('rect')
				.attr('data-pathable', function(d) { return d.series_pathables[0].id; })
				.attr('data-val', function(d) {
					return d.series_val.id || d.series_val.valueOf && d.series_val.valueOf() || '??';
				})
				.on('mouseover', function(d) {
					this_._value = d;
					this_.trigger('brush_visual', d.series_pathables);
					d3.select(this).attr('class', 'brush');
				})
				.on('mouseout', function(d) {
					delete this_._value;
					this_.trigger('unbrush_visual', d.series_pathables);
					d3.select(this).attr('class', 'brush');
				});

			if (barwidth > 10) {
				svg_p
					.selectAll('text.barlabel')
					.data(data)
					.enter()
					.append('text')
					.attr('class','barlabel');

			} else {
				svg_p
					.selectAll('text.barlabel')
					.data(data)
					.remove();				
			}

			svg_p
				.selectAll('text.barlabel')
				.data(data)
				.attr('x', function(d, i) { return side_margins + i*barwidth + 2; })
				.attr('y', function(d) { return height - yscale(d.numeric) - 8 - bottom_margin; })
				.text(function(d) { return to_str(d.numeric); })
				.exit()
				.remove();
			
			// update selection
			svg_p
				.selectAll('rect')
				.data(data)
				.attr('class', function(d) { return d.brush ? 'brush' : ''; })
				.attr('y', function(d,i) { return (height - bottom_margin) - yscale(d.numeric); })
				.attr('x', function(d,i) { return side_margins + i*(barwidth); })
				.attr('height', function(d) { return yscale(d.numeric); })
				.attr('width', barwidth > 6 ? barwidth - 4 : barwidth);

			// exit selection
			svg_p
				.selectAll('rect')
				.data(data)
				.exit().remove();

			// value label
			svg_p
				.selectAll('text.valuedisplay')
			    .data([0])
				.enter()
				.append('text')
				.attr('class', 'valuedisplay')
				.attr('x', 10)
				.attr('y', 24);

			svg_p
				.selectAll('text.valuedisplay')
				.data([0])
				.text(function(d) {
					///// now print the values
					if (!defined(this_._value)) { return ''; }
					if (defined(this_._value.series_pathables) && max_path_length(this_._value.series_pathables) > 0) {
						return to_str(this_._value.series_val); 
					}
					return this_._value.series_pathables.map(function(x) { return x.model.get_label(); }).join(", ");
				});
			

			svg_p
				.selectAll('text.value-label')
			    .data([0])
				.enter()
				.append('text')
				.attr('class', 'value-label')
				.attr('x', 10)
				.attr('y', 44);
			
			svg_p
				.selectAll('text.value-label')
				.data([0])
				.text(function(d) {
					///// now print the source pathables
					if (!defined(this_._value)) { return ''; }
					if (defined(this_._value.series_pathables) && max_path_length(this_._value.series_pathables) > 0) {
						// put the value her
						return this_._value.series_pathables.map(function(x) { return x.model.get_label(); }).join(", ");
					}
				});
			return this;
		}
	});
	
	return {
		SeriesBarPlotter:SeriesBarPlotter
	};
});
