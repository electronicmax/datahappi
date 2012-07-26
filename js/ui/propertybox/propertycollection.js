define(
	[
		'js/ui/propertybox/propertymodel',
		'js/ui/propertybox/pathablecollection'
	],
	function(pm, pc) {
		PropertyCollection = Backbone.Collection.extend({
			model:pm.PropertyModel
		});

		return { PropertyCollection:PropertyCollection};
	}
);
