define(
	[
		'js/ui/propertybox/propertymodel',
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
				this.options.collection.bind('change', function(m) { this_._changed(m); });
				this.options.collection.map(function(m) { this_._changed(m); });
			},
			_changed:function(model){
				// TODO :: iterates over all of the objects in our collection
				// finds our properties and adds nice Models representing each
				// of them to us.
				var that = this;
				_(model.attributes).map(function(val, key) {
					if (_.isUndefined(that.get(key))) {
						var p = new PropertyModel({_id:key});
						that.add(p);
					}
					that.get(key).trigger("change");
				});
			}
		});			
		return {  PropertyCollection:PropertyCollection	};
});

