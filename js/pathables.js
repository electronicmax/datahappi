define(['js/models', 'js/utils'], function(models,utils) {
/*
  initial sketch of dereferencing core data structure
  based on discussion w/ Skinna in UGLabs 24 July 2012
*/

	// pathsteps -- start with path step: single unit of dereference
	var Pathstep = Backbone.Models.extend({
		defaults: { position: -1 }	
	});
	var PropertyDereferenceStep = Pathstep.extend({
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

	// Paths -- each a collection of Pathsteps
	var Pathsteps = Backbone.Collection.extend({
		model:Pathstep,
		comparator:function(component) {return component.get("position"); }
	});	
	var Path = Backbone.Model.extend({
		initialize:function(attrs, options) {
			this.set("steps", new Pathsteps(this.options.steps.concat([]) || []));
		},
		clone:function() {
			return new Path(undefined, { steps: path.get("steps").models });
		},
		add_step:function(new_step) {
			var steps = this.get("steps");
			new_step.set("position", steps.length);
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
			this.constructor.__super__.prototype.initialize(attrs,options);
			this.path = new Path();
			this.values = [this]; // start at path empty/ 
		},
		try_dereference:function(property_name) {
			return this.try_extend_path( new PropertyDereferenceStep({ property : property }) );
		},
		try_extend_path:function(step) {
			// returns changes us in place or undefined if fail
			if (step.test(this)) {
				var value = step.apply(this);
				this.path.add_step(step);
				this.values.push(value);
				this.trigger('path_change', this.value);
				return this.values;
			}
			// dereference fail, don't extend the path
			return undefined;
		},
		get_path_length: function(){ return this.path.get_steps().length; },
		get_path_values: function(){ return this.values.concat([]); },
		value_at:function(step) { return this.values[i]; },
		pop:function() {
			// gets rid of last dereferenced step
			if(this.path.length > 0) {
				var popped_step = this.path.pop();
				var popped_val = this.values.pop();
				return { step: popped_step, value: popped_val };
			}
			return undefined;
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
			this.bind("add", function(m) {
				m.bind("path_change", function() { this_._update_paths(); });
				this_._update_paths();				
			});
			this.bind("remove", function() { this_._update_paths(); });
		},
		_update_paths:function() {
			this.paths = _.uniq(util.flatten(this.map(function(pathable) { return pathable.path; })));
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
		Pathstep:Pathstep,
		PropertyDereferenceStep: PropertyDereferenceStep,
		Pathable: Pathable,
		Pathables: Pathables,
		Paths: Paths
	};
});
