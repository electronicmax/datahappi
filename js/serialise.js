if (typeof define !== 'function') {
	var define = require('amdefine')(module),
	Backbone = require('backbone'),
    _ = require('underscore'),
    url = require("url"),
	log = require('nlogger').logger(module);
}

define(['js/models', 'js/utils'], function(models, u) { 
	var BasicModel = models.Maxel;

	// core serialisation / deserialisation
	var deserialize = function(skeleton, graph) {
		var _des = arguments.callee;
		if (!u.defined(skeleton._id)) { throw new Error({ error: 'unpacking skeleton', details: 'model must have an _id attr' });	}
		var model = new BasicModel({_id: skeleton._id}); // graph.get_or_create <- we don't want to affect our global state
		model.version = skeleton._version;
		model.graph = graph;
		delete skeleton._id;
		delete skeleton._graph;
		delete skeleton._version;
		var helper = function(v) {
			var _me = arguments.callee;
			if (_.isArray(v)) { return v.map(function(vv) { return _me(vv); }); }
			if (typeof(v) == 'object' && v._id) { return _des(v); }
			return v;
		};
		model.set(u.zip(_(skeleton).map(function(v,k) { return [k, helper(v)]; })));
		model.trigger('change');
		return model;	
	};

	var serialize = function(model) {
		// if (model === undefined) { return 'undefined'; }
		var _sm_model = function(m) { return { _id : m.id }; };
		var _sm_literal = function(v) { return v; };
		var _sm_value = function(v) {
			if (v instanceof BasicModel) { return _sm_model(v); }
			return _sm_literal(v);
		};
		return _(u.zip(model.keys().map(function(k) {
			var varr = model.get(k);
			return [k, varr.map(_sm_value)];
		}))).extend(_sm_model(model)); // add the model attributes in // 
	};

	return {
		serialize: serialize,
		deserialize: deserialize
	};
});
