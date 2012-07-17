define(
	[
		'js/ui/propertybox/propertymodel',
		'js/utils',
		'js/ops/chain-engine'
	],
	function(pm, util, ce) {
		var PropertyCollection = Backbone.Collection.extend({
			initialize:function(models, options) {
				var this_ = this;
				var src_c = options.src_collection;
				util.assert(!_(src_c).isUndefined(), "No collection passed");
				src_c.on('change', function(m) { this_._changed(m); })
					.on('add', function(m) { this_._changed(m); })
				    .on('remove', function(m) { this_._changed(m); })
					.map(function(m) { console.log("firing change on ", m); this_._changed(m); });
			},
			comparator: function(model) {
				// Order models by their coverage, with higher coverage first.
				return - (model.get("coverage") || 0);
			},			
			_changed:function(model){
				var this_ = this;
				_(model.attributes).map(function(val, key) {
					if (key == '_id') { return; }
					if (_.isUndefined(this_.get(key))) {
						var p = new pm.PropertyModel({_id:key});
						this_.add(p);
					} else {
						this_.trigger("change", p);
					}
				});
			}
		});			
		return {  PropertyCollection:PropertyCollection	};
});

