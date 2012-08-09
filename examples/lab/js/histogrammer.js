define(['js/utils'],function(utils) {
	var HistView = Backbone.View.extend({
		template:"<div class='hist'></div>",		
		initialize:function() {
			if (this.options.views) { this._register_change();	}
		},
		get_pathables:function() {
			return this.options.views.map(function(x) {	return x.options.model;	});
		},
		
		// render_divs:function() {
		// 	this.$el.html('');
		// 	var data = this._generate_data(this.get_pathables());
		// 	var xscale = d3.scale.linear()
		// 		.domain([0, 10]) // d3.max(data.map(function(x) { return x[1]; }))])
		// 		.range(["0px","200px"]);
		// 	var chart = d3.select(this.el)
		// 		.selectAll('div')
		// 		.data(data)
		// 		.enter()
		// 		.append('div')
		// 		.attr('class', 'bars-horizontal')
		// 		.attr('data-value', function(d) { console.log(' d -- > ', d); return '' + d[0]; }) // for easy debugging
		// 		.style("width", function(d) { return xscale(d[1]); })
		// 		.text(function(d) { return ''+d[0]; });
		// 	return this;
		// },
		
		render:function() {
			this.$el.html('');
			var data = this._generate_data(this.get_pathables());
			var barwidth = 5;
			var height = 20;

			// console.log('d3 max ', d3.max(data.map(function(x) { return x[1]; })));
			
			var yscale = d3.scale.linear()
				.domain([0, d3.max(data.map(function(x) { return x[1]; }))])
				.range([0,height]);

			console.log(' data is >> ', data);
			
			d3.select(this.el)
				.selectAll('rect')
				.data(data)
				.enter()
				.append('rect');

			d3.select(this.el).selectAll('rect')
				.attr('y', function(d,i) { console.log('yscale ', yscale(d[1])); return height - yscale(d[1]); })
				.attr('x', function(d,i) { return i*barwidth; })
				.attr('height', function(d) { return yscale(d[1]); })
				.attr('width', barwidth);
			
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
			this.options.views.on('all', function(eventName) {
				console.log("histogram got a >> ", eventName, 'from view collection');
				this_.render();
			}, this);
		}
	});
	return { HistView: HistView };
});


