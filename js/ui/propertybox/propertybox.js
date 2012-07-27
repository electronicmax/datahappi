define(
	[
		'js/box',
		'js/ui/propertybox/propertyview'
	],
	function(box, pview) {
		/* The floating box containing the list of clickable properties for a patricular Pathables collection.
		 *
		 * Required options:
		 * pathables: Pathables */
		var PropertyBox = box.BoxView.extend({
			// events: {}, Fill out so clicking a property expands it and etc.
			initialize:function(options) {
				var this_ = this;
				this.constructor.__super__.initialize.apply(this, [options]);

				// TODO: See if the line '.on("add", _update_add)' works too.
				this.options.pathables
					.on("add", function(p) {this_._update_add(p);})
					.on("remove", function(p) {this_._update_remove(p);});
			},
			render:function() {
				console.log("Rendering PropertyBox");
				this.constructor.__super__.render.apply(this);
				return this.el;
			},
			setPosition:function(x) {
				this.$el.css("top", x.top);
				this.$el.css("left", x.left);
			},
			_update_add:function(pathable) {
				this_ = this;
				pathable.map(function(attribute, property) {
					if (property === "_id") { return; }
					if (!this_.options.views_collection.get(attribute)) {
						// this_.options.views_collection.add(new pview.PropertyView({
						this_.add(new pview.PropertyView({
							property:property,
							pathables:this_.options.pathables
						}));
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

