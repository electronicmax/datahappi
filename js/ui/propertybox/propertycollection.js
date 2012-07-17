define(
	[
		'js/models/PropertyModel',
		'js/utils'
	],
	function(PropertyModel, util) {
		var PropertyCollection = Backbone.Collection.extend({
			model:PropertyModel,

			// Order models by their coverage.
			comparator: function(model) {
				return model.coverage();
			},
			initialize:function() {
				var this_ = this;
				util.assert(this.options.collection, "No collection passed");
				this.options.collection.bind('change', function() { this_._changed(); });
			},
			_changed:function(){
				// TODO :: iterates over all of the objects in our collection
				// finds our properties and adds nice Models representing each
				// of them to us.
			}
		});
		return {
			PropertyCollection:PropertyCollection
		}
	}
);
