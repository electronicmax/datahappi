define(
	[
		'examples/lab/js/box',
		'examples/lab/js/propertyview'
	],
	function(box, pview) {
		/* The floating box containing the list of clickable properties for a patricular Pathables collection.
		 *
		 * Required options:
		 * pathables: Pathables */

		var template = "<ul class='propitems'></ul>";
		var PropertyBox = box.BoxView.extend({
			// events: {}, Fill out so clicking a property expands it and etc.
			initialize:function(options) {
				this.constructor.__super__.initialize.apply(this, [_({ item_container_class : "propitems" }).extend(options)]);
				var this_ = this;
				this.options.pathables
					.on("add", function(p) {this_._update_add(p);})
					.on("remove", function(p) {this_._update_remove(p);});
			},
			render:function() {
				this.constructor.__super__.render.apply(this);
				this.$el.html(template);
			},
			_update_add:function(pathable) {
				var this_ = this;
				pathable.map(function(attribute, property) {
					if (property === "_id") { return; }
					if (!this_.views_collection.get(attribute)) {
						// this_.options.views_collection.add(new pview.PropertyView({
						var pv = new pview.PropertyView({
							property:property,
							pathables:this_.options.pathables
						});
						this_.add(pv);
						pv.bind('click', function(p) { this_.trigger('property-click', p); });
					}
				});
			},
			_update_remove:function(propModel) {
				// TODO: Remove the view from the box.
			}
		});

		return { PropertyBox:PropertyBox };
	}
);

