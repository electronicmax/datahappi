define(['js/utils'],function(utils) {
	var HistView = Backbone.View.extend({
		template:"<div class='sparkhist'></div>",		
		initialize:function() {
			if (this.options.views) { this._register_change();	}
		},
		get_pathables:function() {
			return this.options.views.map(function(x) {	return x.options.model;	});
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
		render:function() {
			var data = this._generate_data(this.get_pathables());
			var barwidth = 5;
			var height = 20;
			var this_ = this;

			// console.log('d3 max ', d3.max(data.map(function(x) { return x[1]; })));
			
			var yscale = d3.scale.linear()
				.domain([0, d3.max(data.map(function(x) { return x[1]; }))])
				.range([0,height]);

			// enter
			d3.select(this.el)
				.selectAll('rect')
				.data(data, function(d) { return d[0]; })
				.enter()
				.append('rect')
				.on('mouseover', function(d) { this_._brush_value(d[0]); })
				.on('mouseout', function(d) { this_._unbrush_value(d[0]); });

			// update
			d3.select(this.el).selectAll('rect')
				.data(data, function(d) { return d[0]; })			
				.attr('y', function(d,i) { console.log('yscale ', yscale(d[1])); return height - yscale(d[1]); })
				.attr('x', function(d,i) { return i*barwidth; })
				.attr('height', function(d) { return yscale(d[1]); })
				.attr('width', barwidth)
				.attr('data-val', function(d) { return d[0]; });

			// exit
			d3.select(this.el).selectAll('rect')
				.data(data, function(d) { return d[0]; })			
				.exit().remove();
			
			return this;
		},		
		_generate_data:function(pathables) {
			var to_raw_value = function(x) {
				if (x instanceof Backbone.Model) {	return x.id;}
				if (x.valueOf) { return x.valueOf(); }
				return x;
			};
			var values = pathables.map(function(p) { return p.get_last_value()[0]; });
			var raws = values.map(to_raw_value);
			console.log(' raws >> ', raws);
			var uniqs = _.uniq(raws);			
			return uniqs.sort().map(function(val) {
				return [val, raws.filter(function(raw) { return val == raw; }).length];
			});
		},
		setData:function(views) {
			this.options.views = views;
			this._register_change();
		},
		_register_change:function() {
			var this_ = this;
			this.options.views.on('all', function(eventName) { this_.render(); }, this);
		}
	});
	return { HistView: HistView };
});


