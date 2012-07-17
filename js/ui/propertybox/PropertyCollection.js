define(
	[
		'js/models/PropertyModel',
		'js/utils'				
	],
	function(PropertyModel, util) {
		PropertyCollection = Backbone.Collection.extend({
			model:PropertyModel
			initialize:function() {
				var this_ = this;
				util.assert(this.options.collection, "No collection passed");
				dthis.prop_collection = new Backbone.Collection();
				this.options.collection.bind('change', function() { this_._changed(); });				
			},
			_changed:function(){
				// TODO :: iterates over all of the objects in our collection
				// finds our properties and adds nice Models representing each
				// of them to us.				
			}
		});
		return PropertyCollection;
	}
);

