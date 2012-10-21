
var models = require('js/models.js'),
	Backbone = require('backbone'),
    _ = require('underscore'),
    url = require("url"),
	u = require('js/utils.js'),
	log = require('nlogger').logger(module);


// core serialisation / deserialisation
exports.deserialize = function(json, graph) {
	if (!u.defined(json._id)) { throw new Error({ error: 'unpacking json', details: 'model must have an _id attr' });	}
	var model = new models.Maxel({_id: json._id}); // graph.get_or_create <- we don't want to affect our global state
	model.version = json._version;
	model.graph = graph;
	delete json._id;
	delete json._graph;
	delete json._version;
	model.set(json);
	model.trigger('change');
	return model;	
};

exports.serialize = function(model) {
	var _sm_model = function(m) { return { _id : m.id }; };
	var _sm_literal = function(v) { return v; };
	var _sm_value = function(v) {
		if (v instanceof Backbone.Model) { return _sm_model(v); }
		return _sm_literal(v);
	};
	return _(u.zip(model.keys().map(function(k) {
		var varr = model.get(k);
		return [k, varr.map(_sm_value)];
	}))).extend(_sm_model(model)); // add the model attributes in // 
};
