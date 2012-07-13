define(
	[],
	function() {
		var HeterogeneousCollection = Backbone.Collection.extend({
			chainGet:function(properties) {
				return this.models.map(function(model) {
					return model.get_chain(properties);
				}
			}
		});

		return HeterogeneousCollection;
	}
);
