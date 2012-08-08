define(['js/utils'],function(utils) {
	var HistView = Backbone.View.extend({
		template:"<div class='hist'><svg></svg></div>",		
		initialize:function() {
			
		},
		render:function() {
			this.$el.html(template);
			var chart = nv.models.multiBarchart();
			chart.xAxis.tickFormat(d3.format(',f'));
			chart.yAxis.tickFormat(d3.format(',.1f'));
			d3.select(this.$el.find('svg'))
				.datum(this._generate_data()).transition()
				.duration(500)
			    .call(chart);			
			this.chart = chart;
			return this;
		},
		_generate_data:function() {
			var pathables = this.options.collection;
			var values = pathables.map(function(p) { return p.get_last_value() });
			var to_raw_values = function(x) {
				if (x instanceof Backbone.Model) { return x.id; }
				if (x.valueOf && x.valueOf()) { return x.valueOf(); }
				return x;
			};
			var uniq_vals = _uniq(values.map(to_raw_values));

			if (uniq_vals.length < 20) {
				// display them all 
			}  else {
				// bucket them in some way
				
			}
				
			// automatically infer types - if numeric then we bucket; 
		},
		setData:function(pathables) {
			//
			this.options.collection = pathables;
		}
	});
	return { HistView: HistView };
});
	   


  <div id="chart1">
	    <svg></svg>
	  </div>

<script src="../lib/d3.v2.js"></script>
	<script src="../nv.d3.js"></script>
	<script src="../src/tooltip.js"></script>
	<script src="../src/utils.js"></script>
	<script src="../src/models/legend.js"></script>
	<script src="../src/models/axis.js"></script>
	<script src="../src/models/multiBar.js"></script>
	<script src="../src/models/multiBarChart.js"></script>
	<script src="stream_layers.js"></script>
	<script>

var test_data = stream_layers(3,10+Math.random()*100,.1).map(function(data, i) {
	//var test_data = stream_layers(3,1,.1).map(function(data, i) { //for testing single data point
	  return {
		      key: 'Stream' + i,
		      values: data
		    };
	});



nv.addGraph(function() {
	    var chart = nv.models.multiBarChart();

	    chart.xAxis
	        .tickFormat(d3.format(',f'));

	    chart.yAxis
	        .tickFormat(d3.format(',.1f'));

	    d3.select('#chart1 svg')
	        .datum(test_data)
	      .transition().duration(500).call(chart);

	    nv.utils.windowResize(chart.update);

	    return chart;
	});




</script>
	
