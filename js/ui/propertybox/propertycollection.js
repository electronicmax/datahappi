define(
	[
		'js/ui/propertybox/propertymodel',
		'js/utils',
		'js/ops/chain-engine'
	],
	function(pm, util, ce) {
		var PropertyCollection = Backbone.Collection.extend({
			model:pm.PropertyModel,
			initialize:function(models, options) {
				var this_ = this;
				// TEMP: Change 'this.src_c' back to 'var src_c'
				this.src_c = options.src_collection; // The subjects which the properties pertain to. Required.
				util.assert(!_(this.src_c).isUndefined(), "No collection passed");
				this.src_c.on('change', function(m) { this_._change(m); })
					.on('add', function(m) { this_._change_add(m); })
					.on('remove', function(m) { this_._change_remove(m); })
					.map(function(m) {
						this_._change_add(m);
					});
				this.src_c.map(function(srcModel) {
					this_.src_c.trigger('add', srcModel);
				});
			},
			comparator: function(model) {
				// Order property models by their coverage, with higher coverage first.
				return -(model.get("coverage") || 0);
			},
			/*
			_changed:function(srcModel){
				var this_ = this;
				_(srcModel.attributes).map(function(val, key) {
					if (key == '_id') { return; }
					if (_.isUndefined(this_.get(key))) {
						this_._add_property_models(srcModel, key);
					} else {
						this_.trigger("change", srcModel); // What is the significance of this?
					}
				});
			},
			*/
			_change:function(srcModel) {},
			_change_remove:function(srcModel) {},
			_change_add:function(srcModel) {
				var this_ = this;

				var currentChain = _.clone(this._current_chain);
				var propsToAdd = _.uniq(srcModel.attributes);

				// While there are properties to display and expanded properties...
				while (propsToAdd && currentChain.length > 0) {
					// ...follow the chain one step...
					srcModel = srcModel.get(currentChain.shift());

					// ...and get the properties.
					propsToAdd = _.uniq(srcModel.attributes | []);
				}

				propsToAdd.map(function(propName) {
					this_.add(new pm.PropertyModel({_id:propName}));
				});
			},
			_current_chain:[],
			chain_forwards:function(chainProperty) {
				// Slow, dumb solution. Probably optimize/fix.
				this_ = this;
				this._current_chain.push(chainProperty);
				/*
				newProperties = _.uniq(_.flatten(this_.map(function(oldProperty) {
					// Return an array of property models or an empty array.
					return _.keys(oldProperty.get(chainProperty) || {}).map(function(newProperty) {
						return new pm.PropertyModel({_id:newProperty});
					});
				})));
				this.reset(newProperties);
				*/
				this.reset();
				this.src_c.map(function(srcModel) {
					this_.src_c.trigger("add", srcModel);
				});
			},
			chain_backwards:function() {
				// TODO
			},
			// Calling with a model and the name of one of its properties, this method
			// adds the model property to the collection, unless the property is being
			// chained upon, in which case the properties of the subject being pointed to
			// by the intitial properties are added. In the case of one of these properties
			// being chained upon, the method recurses. So far untested.
			_add_property_models:function(srcModel, propertyName, expandListIndex) {
				var this_ = this;
				if (!expandListIndex) { expandListIndex=0; }
				if (this_.current_chain[expandListIndex] === propertyName) {
					if (_.isObject(srcModel.get(propertyName))) {
						_.keys(srcModel.get(propertyName)).filter(function(propertyName) {
							return _.isObject(this_.get(propertyName));
						}).map(function(propertyName) {
							this_._add_property_models(srcModel, propertyName, expandListIndex+1);
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

