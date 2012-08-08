define(['js/utils'],function(utils) {
	var HistView = Backbone.View.extend({
		template:"<div class='hist'></div>",		
		initialize:function() {
			if (this.options.views) { this._register_change();	}
		},
		get_pathables:function() {
			return this.options.views.map(function(x) {	return x.options.model;	});
		},
		render:function() {
			console.log('render!!');
			this.$el.html('');
			var data = this._generate_data(this.get_pathables());
			
			var xscale = d3.scale.linear()
				.domain([0, 10]) // d3.max(data.map(function(x) { return x[1]; }))])
				.range(["0px","200px"]);

			var chart = d3.select(this.el)
				.selectAll('div')
				.data(data)
				.enter()
				.append('div')
				.attr('data-value', function(d) { console.log(' d -- > ', d); return '' + d[0]; }) // for easy debugging
				.style("width", function(d) { return xscale(d[1]); })
				.text(function(d) { return ''+d[0]; });
			
			return this;
		},
		_generate_data:function(pathables) {
			var to_raw_value = function(x) {
				console.log('to raw value ', x);
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


