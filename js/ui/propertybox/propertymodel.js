define(
	[],
	function() {
		var PropertyModel = Backbone.Model.extend({
			idAttribute:"_id",
			initialize:function() {
				// make sure that this.attributes._id is the property name
				this.name = this.attributes._id;
			},
			converage: function() {
				return 0;
			},
			entropy: function() {
				return 0;
			}
		});
		return {
			PropertyModel:PropertyModel
		}
	}
);

