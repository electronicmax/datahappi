define(
	[],
	function() {
		PropertyModel = Backbone.Model.extend({
			coverage: function() {
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

