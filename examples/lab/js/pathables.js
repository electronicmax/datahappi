define(['js/rdf/RDFCollection','js/models', 'js/utils'], function(rdfc,models,utils) {
/*
  initial sketch of dereferencing core data structure
  based on discussion w/ Skinna in UGLabs 24 July 2012
*/
	// pathsteps -- start with path step: single unit of dereference
	var Step = Backbone.Model.extend({
		defaults: { position: -1 },
		valueOf:function(){ utils.assert(false, "subclasses needs to define valueof :( "); }
	});
	var PropertyDereferenceStep = Step.extend({
		idAttribute:'property',
		defaults: { type: "dereference-pathstep", property: undefined },
		test: function(dmodel) {
			// dmodel must be a DereferenceableModel
			var property = this.get("property");			
			utils.assert(!_.isUndefined(property), "Tried to dereference a null property");
			return dmodel && dmodel.get && utils.DEFINED(dmodel.get(property));
		},
		apply: function(dmodel) {
			var property = this.get("property");			
			utils.assert(!_.isUndefined(property), "Tried to dereference a null property");
			return dmodel && dmodel.get && dmodel.get(property);
		},
		valueOf:function(){ return this.property; }
	});

	// Paths -- each a collection of Steps
	var Steps = Backbone.Collection.extend({
		model:Step,
		comparator:function(component) {return component.get("position"); }
	});
	
	var Path = Backbone.Model.extend({
		idAttribute:"_id",
		constructor:function(arg1, arg2) {
			this.constructor.__super__.constructor.apply( this, [] );
			var this_ = this;
			var steps = new Steps((arg1 && arg1.concat([])) || []);
			this.set({"steps": steps});
			steps.on("add remove", function() { this_._update_id(); });
		},
		clone:function(path) {
			return new Path(undefined, { steps: path.get("steps").models });
		},
		add_step:function(new_step) {
			var steps = this.get("steps");
			new_step.set({"position" : steps.length});
			steps.add(new_step);
		},
		get_steps:function() {
			return this.get("steps");
		},
		pop:function() {
			var steps = this.get_steps();
			var last_step = steps.at(steps.length - 1);
			steps.remove(last_step);
			return last_step;
		},
		matches:function(p) {
			return this.get("steps").length == p.get("steps").length &&	this.get("steps").difference(p.get("steps")).length === 0;
		},
		_update_id:function() {
			var new_id = this.get("steps").map(function(x) { return x.id; }).join(',');
			this.set({_id: new_id });
		}
	});
	
	// Pathable is our main Model class that can be the origin (root)
	// of paths
	var Pathable = models.Maxel.extend({
		initialize:function(attrs, options) {
			models.Maxel.prototype.initialize.apply(this, arguments);
			this._set_path_to_root();
		},
		_set_path_to_root:function() {
			this.path = new Path();
			this.values = [[this]]; // start at path empty/ 
		},
		try_set_path:function(p) {
			// sets an entire path from root -> terminus, and returns the terminal
			// value if successful
			var old_path = this.path;
			var old_values = this.values;
			this._set_path_to_root();
			var terminus = this.try_extend_path(p);
			if (!utils.DEFINED(terminus)) {
				this.values = old_values;
				this.path = old_path;
				return undefined;
			}
			return terminus;
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
			var next_value;
			if (_.isArray(last_value)) {
				var next_vals = last_value.map(function(v) {
					if (step.test(v)) { return step.apply(v); }
				}).filter(utils.DEFINED); // NOTE : we lose all values that failed to dereference :/
				if (next_vals.length > 0) {
					next_value = utils.flatten(next_vals);
				}
			} else {
				if (step.test(this.get_last_value())) {
					next_value = step.apply(this.get_last_value());
				}
			}
			if (utils.DEFINED(next_value)) {
				this.path.add_step(step);
				this.values.push(next_value);
				this.trigger('dereference',next_value);
			}
			// console.log("_try_extend_path_by_step returning ", next_value);
			return next_value;
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
				cur_val = this_._try_extend_path_by_step(step);
			}
			if (_.isUndefined(cur_val)) {
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
	var Paths = Backbone.Collection.extend({
		model:Path,
		comparator:function(path) {
			return path.get("path_priority");
		},
		insertAt:function(p,i) {
			this.models.slice(i).map(function(path) {
				path.set({ path_priority : path.get("path_priority") + 1 });
			});
			console.log('setting priority ', i, p.get('steps').length);
			p.set({path_priority:i});
			this.add(p);
			console.log('added now -- paths ', this.length);
			return p;
		}
	});

	/*
	Pathable Collection - this collection also keeps track of
	all of the unique paths that have been applied to all of
	the pathables, and has convenience methods for extending
	the path

	Duties: When a new pathable is added, automatically tries
	dereferencing it according to the set of deref operations
	that have been performed
	*/
	var Pathables = rdfc.RDFCollection.extend({
		model:Pathable,
		initialize:function(models, options) {
			rdfc.RDFCollection.prototype.initialize.apply(this,arguments);
			var this_ = this;
			this.paths = new Paths();
			this.bind("add", function(new_model) {
				// NEW MODEL ADDED > 
				// GO THROUGH Paths previously applied and apply them to this new model
				this_._dereference_model(new_model);
			});
		},
		_dereference_model:function(m) {
			// starts m from scratch and tries to dereference it using each path
			// in order of this.paths			
			utils.assert(m instanceof Pathable, "Only pathables can be dereferenced");
			var dereferenced;
			var paths = this.paths.models;
			for (var p_i = 0; p_i < paths.length && !utils.DEFINED(dereferenced); p_i++) {
				dereferenced = m.try_set_path(paths[p_i]);
				console.log("trying to set path ", paths[p_i].get("steps").map(function(x) { return x.get("property"); }), utils.DEFINED(dereferenced));				
			}
			return dereferenced;
		},
		add_path:function(path, position) {
			// @path : path to add
			// @position: optional - will insert at position if specified, append otherwise
			var this_ = this;
			this.paths.insertAt(path, utils.DEFINED(position) ? position : this.paths.length);
			this.map(function(pathable) {
				this_._dereference_model(pathable);
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
		Paths: Paths,
		get_rdf:function(u) { return new Pathables(undefined, {src_url:u}); }
	};
});


/*
  		// try_extend_path:function(path_or_step) {
		// 	// new path being added
		// 	var this_ = this;
		// 	var superceded_paths = [];
		// 	var new_paths =
		// 		this.pathables
		// 		.map(function(pathable) {
		// 			var superceded_path = pathable.path.clone();
		// 			var result = utils.DEFINED(pathable.try_extend_path(path_or_step));
		// 			if (utils.DEFINED(result)) {
		// 				superceded_paths.push(superceded_path);
		// 				return pathable.path;
		// 			}
		// 		})
		// 		.filter(util.DEFINED);
			
		// 	new_paths.map(function(new_path) {
		// 		if (!this_.paths.get(new_path.id)) {
		// 			this_.paths.add(new_path.clone);
		// 		}
		// 	});
		// 	var current_paths = pathable.map(function(x) { return x.path.id; });
		// 	superceded_paths
		// 		.filter(function(path)  { return paths.indexOf(path) < 0;  } )
		// 		.map(function(dead_path) { this_.paths.remove(dead_path); });
			
		// }
*/
