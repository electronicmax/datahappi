define(['examples/lab/js/pathables', 'js/utils'], function(pathables, utils) {
	
	/* ========= utilities ============= */
	var defined = utils.DEFINED, flatten = utils.flatten, to_numeric = utils.to_numeric, uniq = _.uniq;
	var percentage_of_values_of_type = 0.85;
	var to_raw_value = function(v) { return v.valueOf(); };	
	var get_values = function(pathables)  { return pathables.map(function(pth) { return pth.get_last_value(); }); };
	var get_values_flat = function(pathables)  { return utils.flatten(pathables.map(function(pth) { return pth.get_last_value(); })); };	
	var get_values_numeric = function(pathables)  {
		return pathables.map(function(pth) {
			return pth.get_last_value().map(function(vv) { return to_numeric(vv); });
		});
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
	var count_distinct = function(pathables) {
		var values = get_values_flat(pathables),
			raw_values = values.map(to_raw_value),
			uniq_raws = _.uniq(raw_values);
		return _(uniq_raws).sort().map(function(raw_val) {
			var val_i = raw_values.indexOf(raw_val);
			var val = values[val_i];
			return [val, raw_values.filter(function(raw) { return raw_val == raw; }).length];
		});
	};

	/* ======= visual engines ============= */
	var VisualEngineBase = Backbone.Model.extend({});

	var BarValues = {
		// GBE1 groups by item; requires numeric
		test:function(data, series) {
			// data is _numeric_
			return has_numeric_vals(data) && _.isUndefined(series);
		},
		generate_data:function(pathables, noseries) {
			// [ { series_name : 'series name', series_vals: [ [ valname1 : val1 ] .... ] } ]
			var val_triples = flatten(pathables.map(function(pathable) {
				return pathable.get_last_value().map(function(val) { return [ pathable, val, to_numeric(val)] ;});
			}));
			return _(val_triples)
				.sortBy(function(x) { return x[2]; })
				.map(function(x) { return { series_pathables:[x[0]], series_val:x[1], numeric: x[2] };});
		}
	};

	var BarHist = {
		// GBE1 groups by item; requires numeric
		test:function(data, series) {
			// data is _numeric_
			return !has_numeric_vals(data) && _.isUndefined(series);
		},
		generate_data:function(pathables, noseries) {
			var vals = get_values_flat(pathables), uniqs = uniq(vals);

			return uniqs.map(function(val) {
				// count how many per each val
				var matches = pathables.filter(function(p) { return p.get_last_value().indexOf(val) >= 0; });
				return {
					series_pathables: matches,
					series_val: val,
					numeric: matches.length,
				}	
			});			
		}
	};	

	/*
	
	var HistByItemDiscrete =  VisualEngineBase.extend({
    //   one dimensional histogramming grouped by the item id
	    test:function(data, series) {
			// data is _numeric_
			return has_numeric_vals(data) && _.isUndefined(series);
		},
		generate_data:function(pathables) {
			// [ { series_name : 'series name', series_vals: [ [ valname1 : val1 ] .... ] } ]
			return pathables.map(function(pathable) {
				return {
					series_name: pathable.get_label(),
					series_vals: count_distinct([pathable])
				};
			});
		}
	});
	
	var HistBySeries =  VisualEngineBase.extend({
		test:function(data, series) {
			// data is _numeric_
			return has_numeric_vals(data) && !_.isUndefined(series) && items_overlap(data,series);
		},
		generate_data:function(data_pathables,series_pathables) {
			// join is by item
			
			var series_vals = get_values_flat(series_pathables),
				raw_series = series_vals.map(to_raw_value),
				uniq_raw = _(raw_series).uniq().sort();
			
			return uniq_raw.map(function(uniq_raw_val) {
				var uniq_val = series[raw_series.indexOf(uniq_raw_val)];
				// find all the pathables that have this uniq value
				var relevant_to_cur_series_val = 
					series_pathables.filter(function(p) { pathable.get_last_value().map(to_raw_value).indexOf(uniq_raw_val) >= 0;});
				
				return {
					series_name: uniq_val.get_label ? uniq_val.get_label() : to_raw_value(uniq_val),
					series_vals: count_distinct([relevant_to_cur_series_val])
				};
			});
		}		
	});
	
	
	var BarBySeries = Backbone.View.extend({
		// GBE1 groups by item; requires numeric
		test:function(data, series) {
			// data is _numeric_
			return has_numeric_vals(data) && _.isUndefined(series);
		},
		generate_data:function(pathables) {
			// [ { series_name : 'series name', series_vals: [ [ valname1 : val1 ] .... ] } ]
			return pathables.map(function(pathable) {
				var values = pathable.get_last_value();
				values.sort(function(x,y) { return to_numeric(x) < to_numeric(y); 	});
				return {
					series_name: pathable.get_label(),
					series_vals: values.map(function(x) { return [x, to_numeric(x)]; })
				};
			});
		}
	});
	
	

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

*/

	return {
		BarValues : BarValues 
	};
});
