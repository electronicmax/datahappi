define(
	[],
	function() {
		var propertyModelMaker = function() {
			var modelsWithProperty = [];
			var PropertyModel = Backbone.Model.extend({
				idAttribute:"_id",
				initialize:function(initialAttributes, propertyName) {
					// make sure that this.attributes._id is the property name
					this.attributes._id = propertyName;

					modelsWithproperty = 
						this.collection
							.options
							.collection
							.models
							.fiter(function(model) {
								return !_.isUndefined(model.get(propertyName));
							});
				},
				converage: function() {
					return 0;
				},
				entropy: function() {
					return 0;
				}
			});
		};
		return {
			PropertyModel:propertyModelMaker()
		};
	}
);

