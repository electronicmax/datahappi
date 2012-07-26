define(
	[
		'js/ui/propertybox/propertymodel',
		'js/utils',
		'js/ops/chain-engine',
		'js/pathables'
	],
	function(pm, util, ce, pathables) {
		/* A set of pathables pointed to by a view which all may be chained on a
		 * specific property. Must handle the pathing on pathables once its
		 * PropertyView has been clicked.
		 *
		 * Required options:
		 * property: String
		 * pathables: pathables.Pathables */
		to_base_value= function(v) {
			if (v instanceof Backbone.Model) { return v.id; }
			if (v instanceof Object) { throw Error(" cannot base value of object ");  }
			return v.valueOf();
		};
		var PropertyCollection = Backbone.Collection.extend({
			model:pathables.Pathable,
			initialize:function(models, options) {
				var this_ = this;
				this.property = options.property;
				this.pathables = options.pathables;
				util.assert(
					!_(this.property).isUndefined(),
					"PropertyCollection was not passed a property (String)");
				util.assert(
					!_(this.pathables).isUndefined(),
					"PropertyCollection was not passed a pathables (pathables.Pathables)");

				this.pathables
					.on('change', function(p) { this_._change(p); })
					.on('add', function(p) { this_._change_add(p); })
					.on('remove', function(p) { this_._change_remove(p); })
					.map(function(p) { // TODO: Is this block neccessary as well as the following block?
						this_._change_add(p);
					});
				// Simulate the pathables collection being empty and filling up.
				this.pathables.map(function(pathable) {
					this_.pathables.trigger('add', pathable);
				});
			},
			_change:function(pathable) {
				_update_coverage();
				_update_entropy();
			},
			_change_remove:function(pathable) {
				// If a pathable does not exist in the pathables collection, it cannot exist in this collection.
				this.remove(pathable);
				_update_coverage();
				_update_entropy();
			},
			_change_add:function(pathable) {
				chainedPathable = pathable.get_last_value();
				if (_.isObject(chainedPathable) && _.keys(chainedPathable.attributes).indexOf(this.property) > -1) {
					this.add(pathable);
					_update_coverage();
					_update_entropy();
				}
			},
			_update_coverage:function() {
				var coverage = this.models.length * 1.0/this.pathables.length;
				this.set({'coverage': coverage});
			},
			_update_entropy:function() {
				// find all models in our collection that have us.
				// find all models that have this property.
				var this_ = this;
				var values = this.map(function(p) {
					return to_base_value(p.get(this.property));
				});
				var entropy = _.uniq(values).length * 1.0 / values.length;
				this.set({'entropy': entropy});
			}
		});
		return {  PropertyCollection:PropertyCollection };
	}
);

