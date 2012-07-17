define(
	['js/models/PropertyModel'],
	function(PropertyModel) {
		PropertyCollection = Backbone.Collection.extend({
			model:PropertyModel,

			// Order models by their coverage.
			comparator: function(model) {
				return model.coverage();
			}
		});
		return PropertyCollection;
	}
);

