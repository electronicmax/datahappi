define(['js/utils'], function(utils) {
	var defined = utils.DEFINED;
	var to_numeric = utils.to_numeric;
	var percentage_of_values_of_type = 0.85;
	
	var get_values = function(pathables)  {
		return pathables.map(function(pth) { return [pth, pth.get_last_value()]; });
	};
	var get_values_numeric = function(pathables)  {
		return pathables.map(function(pth) {
			return pth.get_last_value().map(function(vv) { return to_numeric(vv); });
		});
	};	
	var get_values_flat = function(pathables)  {
		return utils.flatten(pathables.map(function(pth) { return  pth.get_last_value(); }));
	};	   
	var has_numeric_vals = function(pathables) {
		var vals = get_values_flat(pathables);
		if (vals.length === 0) { return false; }		
		return vals.filter(function(v) {
			return _(v).isNumber() || _(parseInt(v,10)).isNumber();
		}).length * 1.0 / vals.length > percentage_of_values_of_type;
	};	
	var has_non_numeric_vals = function(pathables) {
		var vals = get_values(pathables);
		if (vals.length === 0) { return false; }		
		return vals.filter(function(v) {
			return defined(v) && !_(v).isNumber() || _(parseInt(v,10)).isNaN();
		}).length * 1.0 / vals.length > percentage_of_values_of_type;
	};
	
	var SeriesBarPlotter = Backbone.View.extend({
		// requires an 'svg' el
		render:function(data) {
		}
	});
	
	var HistByItemDiscrete = Backbone.View.extend({
		initialize:function() {
		},
		test:function(data, series) {
			// data is _numeric_
			return has_numeric_vals(data) && _.isUndefined(series);
		},
		get_data_grouped_by_series:function(pathables) {
			// [ { series_name : 'series name', series_vals: [ [ valname1 : val1 ] .... ] } ]
			return pathables.map(function(pathable) {
				return {
					series_name: pathable.get_label(),
					series_vals: []
				};
			});
		}
	});

	
	// var HistByItemBucketed = Backbone.View.extend({
	// 	test:function(data, series) {
	// 		// data is _numeric_
	// 		// TODO DODO 
	// 		return false && has_numeric_vals(data) && _.isUndefined(series);
	// 	}
	// });	
	var BarGroupByItem = Backbone.View.extend( {
		// GBE1 groups by item; requires numeric
		test:function(data, series) {
			// data is _numeric_
			return has_numeric_vals(data) && _.isUndefined(series);
		}
	} );

	var GroupedBarEngine2 = Backbone.View.extend({
		test:function(data1, series) {
			// we function either when data is _numeric_
			return has_numeric_vals(data1) && _.isUndefined(series);
		}
	});

	var Scatter = Backbone.View.extend({
		test:function(data1, data2) {
			// we function either when data is _numeric_
			return has_numeric_vals(data1) && has_numeric_vals(data2);
		}
	});	

	return {
		engines: [
		]
	};
});
