define(
	[
		'js/ui/propertybox/propertyview',
		'js/pathables'
	],
	function(pv, pathables) {
		/* A model representing a single property which may be the next step in a
		 * chain for one or more models in a pathables collection.
		 *
		 * Required options:
		 * property: String
		 * pathables: pathables.Pathables */
		var PropertyModel = Backbone.Model.extend({
			initialize:function(options) {
				// Test for required options.
				util.assert(!_(this.property).isUndefined(),
					"PathableCollection was not passed a property (String)");
				util.assert(!_(this.pathables).isUndefined(),
					"PathableCollection was not passed a pathables (pathables.Pathables)");

				this.pathable_collection = new pc.PathableCollection({
					property:options.property,
					pathables:options.pathables
				});
				this.pathable_collection.on('change', function(p) { _update_coverage(); _update_entropy(); });

				this.view = new pv.PropertyView();
			},
			_update_coverage:function() {
				var coverage = this.pathable_collection.models.length * 1.0/this.pathables.length;
				this.set({'coverage': coverage});
			},
			_update_entropy:function() {
				var values = this.pathable_collection.map(function(p) {
					return to_base_value(p.get(this.property));
				});
				var entropy = _.uniq(values).length * 1.0 / values.length;
				this.set({'entropy': entropy});
			}
		});

		return { PropertyModel:PropertyModel };
	}
);
