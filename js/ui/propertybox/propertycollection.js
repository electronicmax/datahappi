define(
	[
		'js/ui/propertybox/propertymodel',
		'js/utils',
		'js/ops/chain-engine'
	],
	function(pm, util, ce) {
		var PropertyCollection = Backbone.Collection.extend({
			initialize:function(models, options) {
				var this_ = this;
				var src_c = options.src_collection; // The properties to be shown in the box.
				util.assert(!_(src_c).isUndefined(), "No collection passed");
				src_c.on('change', function(m) { this_._changed(m); })
					.on('add', function(m) { this_._changed(m); })
					.on('remove', function(m) { this_._changed(m); })
					.map(function(m) {
						console.log("firing change on ", m); this_._changed(m);
					});
			},
			comparator: function(model) {
				// Order models by their coverage, with higher coverage first.
				return - (model.get("coverage") || 0);
			},
			_changed:function(model){
				var this_ = this;
				_(model.attributes).map(function(val, key) {
					if (key == '_id') { return; }
					if (_.isUndefined(this_.get(key))) {
						//
						this_._add_property_models(model, key);
					} else {
						this_.trigger("change", model); // What is the significance of this?
					}
				});
			},
			_expand_list:[],
			_expand_property:function(propertyID) {
				console.log('expanding ', propertyID);
				this._expand_list.push(propertyID);
				this.trigger("change", propertyID);
			},
			// Calling with a model and the name of one of its properties, this method
			// adds the model property to the collection, unless the property is being
			// chained upon, in which case the properties of the subject being pointed to
			// by the intitial properties are added. In the case of one of these properties
			// being chained upon, the method recurses. So far untested.
			_add_property_models:function(model, propertyName, expandListIndex) {
				var this_ = this;
				if (!expandListIndex) { expandListIndex=0; }
				if (this_._expand_list[expandListIndex] === propertyName) {
					if (_.isObject(model.get(propertyName))) {
						_.keys(model.get(propertyName)).filter(function(propertyName) {
							return _.isObject(this_.get(propertyName));
						}).map(function(propertyName) {
							this_._add_property_models(model, propertyName, expandListIndex+1);
						});
					}
				} else {
					this.add(new pm.PropertyModel({_id:propertyName}));
				}
			}
		});
		return {  PropertyCollection:PropertyCollection };
	}
);

