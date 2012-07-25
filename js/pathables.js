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
			if (step_or_path instanceof Path) {
				return this._try_extend_path_by_path(step_or_path);
			}
			console.assert(step_or_path instanceof Step, "It's not a path, and it's not a step. WHAT IS IT?");
			return this._try_extend_path_by_step(step_or_path);
		},
		_try_extend_path_by_step:function(step) {
			// returns changes us in place or undefined if fail
			if (step.test(this)) {
				var next_value = step.apply(this.get_last_value());
				this.path.add_step(this.get_last_value());
				this.values.push(next_value);
				return this.values;
			}
			// dereference fail, don't extend the path
			return undefined;
		},
		_try_extend_path_by_path:function(path) {
			// save the current path and values
			var this_ = this;
			var old_steps = this.path.get("steps").models.concat([]);
			var old_vals = this.values.concat([]);

			// only succeed if the entire path succeeds. otherwise fall back
			var cur_val = true;
			for (var ii = 0; ii < path.get("steps").length && !_.isUndefined(cur_val); ii++) {
				var step = path.get("steps").at(ii);
				cur_val = this_._try_extend_path_by_path(step, true);
			}
			if (_.isUndefined(cur_val)) {
				// ROLL BACK! WE FAILED :'(
				this.values = old_vals; // :'(
				this.path.get("steps").reset();
				this.path.get("steps").add(old_steps); // :'(
			}
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
			this.paths = new Paths();
			this.bind("add", function(new_model) {
				// apply path to this m.
				if (new_model instanceof Pathable) {
					// m is a pathable
					var dereferenced = false;
					for (var p_i = 0; p_i < this_.paths.length && !(dereferenced); p_i++) {
						dereferenced = this_.paths[p_i].try_apply_path(new_model);
					}
				}
				new_model.path.bind("change", function() { this_._update_paths(); });
				this_._update_paths();				
			});
			this.bind("remove", function() { this_._update_paths(); });
		},
		_update_paths:function() {
			this.paths = _.uniq(utils.flatten(this.map(function(pathable) { return pathable.path; })));
			return this.paths;
		},
		try_extend_path:function(step) {
			return this.map(function(pathable) {
				var result = pathable.try_extend_path(step);
				return [pathable, result];
			});
		},
		get_paths:function() {
			return this.paths.concat([]); // return a clone of the unique paths
		}
	});
	
	return {
		Step:Step,
		PropertyDereferenceStep: PropertyDereferenceStep,
		Pathable: Pathable,
		Pathables: Pathables,
		Paths: Paths
	};
});
