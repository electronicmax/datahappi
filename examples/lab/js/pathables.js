define(['js/source','js/models', 'js/utils'], function(source,models,utils) {
	/*
	  initial sketch of dereferencing core data structure
	  based on discussion w/ Skinna in UGLabs 24 July 2012
	*/
	
	var defined = utils.DEFINED;
	var assert = utils.assert;
	var	model_subscribe = function(pathable, event, callback, whom) {
		pathable.model.on(event,function(_implicit_args_) {
			callback.apply(null, [pathable].concat($.makeArray(arguments)));
		},whom);
	};
	var	model_unsubscribe = function(pathable, whom) {	pathable.model.off(null,null,whom);};
	
	
	// pathsteps -- start with path step: single unit of dereference
	var Step = Backbone.Model.extend({
		defaults: { position: -1 },
		clone:function() {	return new this.constructor(this.attributes);	},
		valueOf:function(){ utils.assert(false, "subclasses needs to define valueof :( "); }
	});
	
	var PropertyDereferenceStep = Step.extend({
		idAttribute:'position',
		defaults: { type: "dereference-pathstep", property: undefined },
		test: function(dmodel) {
			// dmodel must be a DereferenceableModel
			var property = this.get("property");			
			utils.assert(!_.isUndefined(property), "Tried to dereference a null property");
			return dmodel && dmodel.get && defined(dmodel.get(property));
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
		comparator:function(component) {
			return component.get("position");
		}
	});

	var Path = Backbone.Model.extend({
		idAttribute:"_id",
		constructor:function(arg1, arg2) {
			this.constructor.__super__.constructor.apply( this, [] );
			var this_ = this;
			var steplist = arg1 && arg1.length ? arg1.map(function(x) { return x.clone(); }) : [];
			_(steplist).each(function(x, index) { x.set({position:index}); });			
			var steps = new Steps(steplist); 
			this.set({"steps": steps});
			this_._update_rid();
			steps.on("add remove", function() {
				// this_._update_id();
				this_.trigger('change');
			});
		},
		clone:function(path) {
			return new Path(this.get("steps").models);
		},
		add_step:function(new_step) {
			var steps = this.get("steps");
			new_step = new_step.clone();
			new_step.set({position : steps.length});
			steps.add(new_step);
			console.log('steps positions now ', steps.length, steps.map(function(x) { return x.get('position'); }));
			return this;
		},
		get_steps:function() { return this.get("steps");	},
		get_last_step:function() {
			var steps = this.get("steps");
			return steps.get(steps.length - 1);
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
			return this;
		},
		_update_rid:function() {
			this.set({_id: (new Date()).valueOf() });
			return this;
		}		
	});
	
	var Pathable = Backbone.Model.extend({
		// using model we're really just a wrapper for the actual model --
		// but we need to be a model in order to be added
		idAttribute:'model_id',
		initialize:function(options) {
			var this_ = this;
			assert(!_(options.model).isUndefined(), "model must be specified");
			this.setModel(options.model);
			this.model.on('all', function(eventType, args) {
				// console.log("model got ", this_.model.id, eventType);
				this_.set_path(this_.path, true);
				this_.trigger(eventType, args);
			});
			this.reset_path();
		},
		setModel:function(m) {
			// console.log('setting model ', m, ' ', m.id);
			this.model = m;
			this.set({model_id : m.id });
		},
		clone:function() {
			return new Pathable({model:this.model});
		},
		get_last_value:function() {
			return this.values[this.values.length - 1];
		},
		get_base_model:function() { return this.values[0][0];	},				
		reset_path:function() {
			this.path = new Path();
			this.values = [[this.model]]; // start at path empty/
			this.trigger('dereference');			
		},
		try_path:function(path, from_root) {
			// sets an entire path from root -> terminus, and returns the terminal
			// value if successful
			var cur_val = [this.model], values = [[this.model]], steps = path.get("steps");
			for (var ii = 0; ii < steps.length && cur_val.length > 0; ii++) {
				var step = steps.at(ii);
				cur_val = utils.flatten(cur_val.map(function(v) {
					if (step.test(v)) { return step.apply(v); }
				}).filter(defined));
				values.push(cur_val);
			}
			return cur_val.length > 0 && values.length == steps.length + 1 ? values : undefined;
		},
		try_step:function(step,from_root) {
			if (from_root) {return this.try_path(new Path([step]));	}
			return this.try_path(this.path.clone().add_step(step));
		},
		set_path:function(p, silent) {
			var values = this.try_path(p, true);
			if (defined(values)) {
				this.path = p.clone();
				this.values = _(values).clone();
				if (silent !== true) { this.trigger('dereference'); }
				return values;
			}			
		},
		extend_path:function(step) {
			return this.set_path(this.path.clone().add_step(step));
		},
		get_path_length: function(){ return this.path.get_steps().length; },
		get_path_values: function(){ return this.values.concat([]); },
		value_at:function(step) { return this.values[step]; }
	});

	var Paths = Backbone.Collection.extend({
		model:Path,
		comparator:function(path) {
			return path.get("path_priority");
		},
		add:function(path_array) {
			Backbone.Collection.prototype.add.apply(this,arguments);
			var this_ = this;
			
			// If path_array is a single element, turn it into a single-element array
			if (!_.isArray(path_array)) {
				path_array = [path_array];
			}			
			_(path_array).each(function(path, i) {
				if (_.isUndefined(path.get('path_priority'))) {
					path.set({path_priority:this_.length + i});
				}
			});			
			path_array.map(function(path) {
				path.on('change', function() { this_.trigger('pathchange', path); });
			});
		},
		insertAt:function(p,i) {
			console.log("insertAt ", p.get('steps').map(function(s) { return s.get('property'); }), i);
			if (_(i).isUndefined()) { i = this.models.length; }
			_(this.models).each(function(path, j) {
				if (j < i) {
					path.set({ path_priority : j });
				} else {
					path.set({ path_priority : j + 1 });
				}
			});
			console.log(' finally, setting >> ', p.id, ' - ', p.get('steps').map(function(s) { return s.get('property'); }), ' -> ', i);			
			p.set({path_priority:i});
			this.add(p);
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
	var Pathables = Backbone.Collection.extend({
		model:Pathable,
		initialize:function(models, options) {
			Backbone.Collection.prototype.initialize.apply(this,arguments);
			var this_ = this;
			this.paths = new Paths();
			this.bind("add remove", function(pathable) { this_._apply_paths(pathable);	});			
			this.paths.bind("all", function(eventType, pathable) {
				this_.map(function(pathable) { return this_._apply_paths(pathable); });
			});
			this.model_subscriptions = [];
		},
		add:function(models) {
			var this_ = this;
			if (!_.isArray(models)) { models = [models]; }
			var pathables = models.map(function(m) { 
				if (!(m instanceof Pathable)) { return new Pathable({model:m}); }
				return m;
			});
			pathables.map(function(pathable) {
				this_.model_subscriptions.map(function(sub) {
					model_subscribe(pathable, sub.event, sub.callback, sub.whom);
				});
			});
			return Backbone.Collection.prototype.add.apply(this,[pathables]);
		},
		remove:function(models) {
			var this_ = this;
			if (!_.isArray(models)) { models = [models]; }
			models.map(function(pathable) {
				this_.model_subscriptions.map(function(sub) {
					model_unsubscribe(pathable, sub.whom);
				});
			});			
			return Backbone.Collection.prototype.remove.apply(this,[models]);
		},
		_apply_paths:function(m) {
			// starts m from scratch and tries to dereference it using each path
			// in order of this.paths - which is essentially the priority
			utils.assert(m instanceof Pathable, "Only pathables can be dereferenced");
			var paths = this.paths.models;
			for (var p_i = 0; p_i < paths.length; p_i++) {
				var path = paths[p_i];
				var result = m.try_path(path);
				if (defined(result)) {	return m.set_path(path);	} 
			}
			// no paths met us, let's just reset 
			return m.reset_path();			
		},
		try_path:function(path) {
			var result = this.map(function(pathable) {
				return pathable.try_path(path);
			}).filter(defined);
			if (result.length > 0) { return result };
		},
		// @path : path to add
		// @position: optional - will insert at position if specified, append otherwise
		add_path:function(path, position) {
			// @path : path to add
			// @position: optional - will insert at position if specified, append otherwise
			this.paths.insertAt(path, defined(position) ? position : this.paths.length);
			// trigger will automatically recompute above
		},
		remove_path:function(path) { this.paths.remove(path); },
		reset_paths:function(paths) {
			var this_ = this;
			this.paths.map(function(path) {
				this_.remove_path(path);
			});
			paths.map(function(path) {
				this_.add_path(path);
			});
		},
		on_model:function(eventType, callback, whom) {
			this.model_subscriptions.push({ event : eventType, callback : callback, whom: whom });
			this.map(function(pathable) { model_subscribe(pathable, eventType, callback, whom); });
			return this; 
		},
		off_model:function(eventType, whom) {
			var target = model_subscriptions.filter(function(ms) {
				return (eventType == null || ms.event == eventType) && (whom == ms.whom);
			});
			this.model_subscriptions = _(this.model_subscriptions).difference(target);			
			this.map(function(pathable) { model_unsubscribe(pathable, eventType, null, whom); });
			return this; 
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
		get_from_source:function(url, source_name) {
			return source.get_from_source(url, models.Maxel, Pathables, source_name);
		}
	};
});

