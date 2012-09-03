define(['js/utils'], function(utils) {
	
	var SeriesBarPlotter = Backbone.View.extend({
		
		render:function(data) {
			// this.$el is bound to svg
			console.log('SBP.render() :: ', data);
			var this_ = this,
				svg_p = d3.select(this.$el[0]),
				height = this.$el.height(),
				width = this.$el.width(),
				spacing = 2,
				barwidth = ( width / data.length ),
				max_val = d3.max(data.map(function(d) { return d.numeric; })),
				yscale = d3.scale.linear().domain([0,max_val]).range([0,height - 20]);

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
				.attr('x', function(d, i) { return i*barwidth; })
				.attr('y', function(d) { return height - yscale(d.numeric) - 5; })
				.text(function(d) { return ''+d.numeric; })
				.exit()
				.remove();
			
			// update selection
			svg_p
				.selectAll('rect')
				.data(data)
				.attr('class', function(d) { return d.brush ? 'brush' : ''; })
				.attr('y', function(d,i) { return height - yscale(d.numeric); })
				.attr('x', function(d,i) { return i*(barwidth); })
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
				.attr('y', 20);
			
			svg_p
				.selectAll('text.valuedisplay')
				.data([0])
				.text(function(d) { return this_._value ? this_._value.numeric : '';  });
			
			svg_p
				.selectAll('text.value-label')
			    .data([0])
				.enter()
				.append('text')
				.attr('class', 'value-label')
				.attr('x', 10)
				.attr('y', 40);
			
			svg_p
				.selectAll('text.value-label')
				.data([0])
				.text(function(d) { return this_._value && this_._value.series_pathables.length ? this_._value.series_pathables[0].model.get_label() : '';  });
			
			return this;
		}
	});
	
	return {
		SeriesBarPlotter:SeriesBarPlotter
	};
});
