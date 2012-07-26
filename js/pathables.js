define(['js/models', 'js/utils'], function(models,utils) {
/*
  initial sketch of dereferencing core data structure
  based on discussion w/ Skinna in UGLabs 24 July 2012
*/
	// pathsteps -- start with path step: single unit of dereference
	var Step = Backbone.Model.extend({
		defaults: { position: -1 }	
	});
	var PropertyDereferenceStep = Step.extend({
		defaults: { type: "dereference-pathstep", property: undefined },
		test: function(dmodel) {
			// dmodel must be a DereferenceableModel
			var property = this.get("property");			
			utils.assert(!_.isUndefined(property), "Tried to dereference a null property");
			console.log(property, dmodel.attributes, dmodel);
			return dmodel.get(property) !== undefined;
		},
		apply: function(dmodel) {
			var property = this.get("property");			
			utils.assert(!_.isUndefined(property), "Tried to dereference a null property");
			return dmodel.get(property);			
		}
	});

	// Paths -- each a collection of Steps
	var Steps = Backbone.Collection.extend({
		model:Step,
		comparator:function(component) {return component.get("position"); }
	});	
	var Path = Backbone.Model.extend({
		initialize:function(attrs, options) {
			this.set({"steps": new Steps((this.options && this.options.steps.concat([])) || [])});
		},
		clone:function(path) {
			return new Path(undefined, { steps: path.get("steps").models });
		},
		add_step:function(new_step) {
			var steps = this.get("steps");
			new_step.set({"position" : steps.length});
			steps.add(new_step);
		},
		get_steps:function() { return this.get("steps"); },
		pop:function() {
			var steps = this.get_steps();
			var last_step = steps.at(steps.length - 1);
			steps.remove(last_step);
			return last_step;
		},
		matches:function(p) {
			return this.get("steps").length == p.get("steps").length &&
				this.get("steps").difference(p.get("steps")).length == 0;
		}
	});

	// Pathable is our main Model class that can be the origin (root)
	// of paths
	var Pathable = models.Maxel.extend({
		initialize:function(attrs, options) {
			models.Maxel.prototype.initialize.apply(this, arguments);
			this.path = new Path();
			this.values = [this]; // start at path empty/ 
		},
		try_dereference:function(property_name) {
			return this.try_extend_path( new PropertyDereferenceStep({ property : property_name }) );
		},
		try_extend_path:function(step_or_path) {
			if (step_or_path instanceof Path) {	return this._try_extend_path_by_path(step_or_path);	}
			console.assert(step_or_path instanceof Step, "It's not a path, and it's not a step. WHAT IS IT?");
			return this._try_extend_path_by_step(step_or_path);
		},
		_try_extend_path_by_step:function(step) {
			// returns changes us in place or undefined if fail
			var last_value = this.get_last_value();
			var next_value = undefined;
			console.log("_try_extend_path_by_step ", step, this, this.path, last_value);
			if (_.isArray(last_value)) {
				var next_vals = last_value.map(function(v) {
					return step.apply(v);
				}).filter(utils.DEFINED); // NOTE : we lose all values that failed to dereference :/
				if (next_vals.length >= 0) {
					next_value = utils.flatten(next_vals);
				}
			}	else {
				next_value = step.apply(this.get_last_value());
			}
			if (utils.DEFINED(next_value)) {
				this.path.add_step(step);
				this.values.push(next_value);
			}
			return next_value;
		},
		_try_extend_path_by_path:function(path) {
			// save the current path and values
			console.log('try extend path by path ', path);
			var this_ = this;
			var old_steps = this.path.get("steps").models.concat([]);
			var old_vals = this.values.concat([]);
			// only succeed if the entire path succeeds. otherwise fall back
			var cur_val = true;
			for (var ii = 0; ii < path.get("steps").length && !_.isUndefined(cur_val); ii++) {
				var step = path.get("steps").at(ii);
				console.log("TEPBP > attempting step ", ii, step);
				cur_val = this_._try_extend_path_by_step(step);
			}
			if (_.isUndefined(cur_val)) {
				console.log(" step failed! abort! ");
				// ROLL BACK! WE FAILED :'(
				this.values = old_vals; // :'(
				this.path.get("steps").reset();
				this.path.get("steps").add(old_steps); // :'(
			}
			return cur_val;
		},		
		get_path_length: function(){ return this.path.get_steps().length; },
		get_path_values: function(){ return this.values.concat([]); },
		value_at:function(step) { return this.values[step]; },
		pop:function() {
			// gets rid of last dereferenced step
			if(this.path.length > 0) {
				var popped_step = this.path.pop();
				var popped_val = this.values.pop();
				return { step: popped_step, value: popped_val };
			}
			return undefined;
		},
		get_last_value:function() {
			return this.values[this.values.length - 1];
		}
	});

	// 
	var Paths = Backbone.Collection.extend({model:Path});

	// Pathable Collection - this collection also keeps track of
	// all of the unqiue paths that have been applied to all of
	// the pathables, and has convenience methods fore 
	var Pathables = Backbone.Collection.extend({
		model:Pathable,
		initialize:function() {
			var this_ = this;
			this.bind("add", function(new_model) {
				// apply path to this m.
				if (new_model instanceof Pathable) {
					// m is a pathable
					var dereferenced = undefined;
					var paths = this_.get_paths();
					for (var p_i = 0; p_i < paths.length && !utils.DEFINED(dereferenced); p_i++) {
						console.log("TRYING TO APPLY PATH ", paths[p_i].get("steps").map(function(x) { return x.get("property"); }));
						dereferenced = new_model.try_extend_path(paths[p_i]);
					}
				}
			});
		},
		get_paths:function() {
			var paths = this.map(function(pathable) { return pathable.path; });
			return paths; // TEMP
		},
		try_extend_path:function(path_or_step) {
			return this.map(function(pathable) {
				var result = pathable.try_extend_path(path_or_step);
				return [pathable, result];
			});
		}
	});

	return {
		Step:Step,
		PropertyDereferenceStep: PropertyDereferenceStep,
		Steps:Steps,
		Pathable: Pathable,
		Pathables: Pathables,
		Path:Path,
		Paths: Paths
	};
});
