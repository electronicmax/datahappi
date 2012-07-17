define(
	[],
	function() {
		PropertyModel = Backbone.Model.extend({
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

