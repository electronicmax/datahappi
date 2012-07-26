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
		var PathableCollection = Backbone.Collection.extend({
			model:pathables.Pathable,
			initialize:function(models, options) {
				var this_ = this;
				this.property = options.property;
				this.pathables = options.pathables;
				util.assert(
					!_(this.property).isUndefined(),
					"PathableCollection was not passed a property (String)");
				util.assert(
					!_(this.pathables).isUndefined(),
					"PathableCollection was not passed a pathables (pathables.Pathables)");

				this.pathables
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
			_change_remove:function(pathable) {
				// If a pathable does not exist in the pathables collection, it cannot exist in this collection.
				this.remove(pathable);
			},
			_change_add:function(pathable) {
				var chainedPathable = pathable.get_last_value();
				if (_.isObject(chainedPathable) && _.keys(chainedPathable.attributes).indexOf(this.property) > -1) {
					this.add(pathable);
				}
			}
		});
		return { PathableCollection:PathableCollection };
	}
);

