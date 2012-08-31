define(['examples/lab/js/visual','js/utils'],function(visual,utils) {

	var to_raw_value = function(v) { return v.valueOf(); };	
	
	var HistView = visual.VisualBase.extend({
		template:"<div class='sparkhist'></div>",		
		initialize:function() {
			if (this.options.views) { this._register_change();	}
		},
		get_pathables:function() {
			return this.options.views.map(function(x) {	return x.options.model;	});
		},
		render:function() {
			var data = this._get_counts(this.options.views);
			var barwidth = 4;
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
				.on('mouseover', function(d) {
					// console.log('enter > ', d); 
					d3.select(this).attr('class', 'brush');
					this_._brush_value(d[0]);					
				})
				.on('mouseout', function(d) {
					// this_._unbrush_value(d[0]);
					d3.select(this).attr('class', '');
					this_._unbrush_value(d[0]);										
				});			

			// update
			d3.select(this.el).selectAll('rect')
				.data(data, function(d) { return d[0]; })			
				.attr('y', function(d,i) { return height - yscale(d[1]); })
				.attr('x', function(d,i) { return i*(barwidth + 3); })
				.attr('height', function(d) { return yscale(d[1]); })
				.attr('width', barwidth)
				.attr('data-val', function(d) { return d[0]; });
			
			
			// exit
			d3.select(this.el).selectAll('rect')
				.data(data, function(d) { return d[0]; })			
				.exit().remove();
			
			return this;
		},		
		setData:function(views) {
			this.options.views = views;
			this._register_change();
		},
		_register_change:function() {
			var this_ = this;
			this.options.views.on('all', function(eventName) { this_.render(); }, this);
		},
		_find_pathables_with_raw_value:function(raw_value) {
			var this_ = this;
			if (_(this.options.views).isUndefined()) { return []; }
			return _.uniq(this.options.views.filter(function(V) {
				var m = V.options.model;
				return m.get_last_value().map(to_raw_value).indexOf(raw_value) >= 0;
			}).map(function(x) { return x.options.model; }));
		},
		_brush_value:function(raw_value) {
			this.options.views.trigger('brush', this._find_pathables_with_raw_value(raw_value));
		},
		_unbrush_value:function(raw_value) {
			this.options.views.trigger('unbrush', this._find_pathables_with_raw_value(raw_value));						
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
	return { HistView: HistView };
});


