define(['js/utils'], function(utils) {

	var get_values = function()  {
		
	};

	var has_numeric_values = function(pathables) {
		var vals = get_values(pathables);
		return vals.filter(function(v) {
			return _(v).isNumber() || _(parseInt(v,10)).isNumber();
		}).length * 1.0 / vals.length > 0.5;
	};
	
	var has_non_numeric__values = function(pathables) {
		var vals = get_values(pathables);
		vals.filter(function(v) { return _(v).isNumber() || _(parseInt(v,10)).isNumber()); });
	};

	   

	var HistByItemDiscrete = function() {
		test:function(data, series) {
			// data is _numeric_
			return (data) && _.isUndefined(series);
		}
	};
	var HistByItemBucketed = function() {
		test:function(data, series) {
			// data is _numeric_
			return (data) && _.isUndefined(series);
		}
	};	
	var BarGroupByItem = function() {

		// GBE1 groups by item; requires numeric
		test:function(data, series) {
			// data is _numeric_
			return has_numeric_values(data) && _.isUndefined(series);
		}
	};

	var GroupedBarEngine2 = function() {
		test:function(data1, series) {
			// we function either when data is _numeric_
			return has_numeric_values(data) && _.isUndefined(series);
		}
	};

	var Scatter = function() {
		test:function(data1, series) {
			// we function either when data is _numeric_
			return has_numeric_values(data1) && has_numeric_values(data2);
		}

	}
	

	return {
		engines: [
			
		]
	}
});
