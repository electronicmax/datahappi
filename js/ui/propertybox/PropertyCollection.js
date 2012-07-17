define(
	['js/models/PropertyModel'],
	function(PropertyModel) {
		PropertyCollection = Backbone.Collection.extend({
			model:PropertyModel
		});
		return PropertyCollection;
	}
);

