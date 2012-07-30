define(
	[
		'examples/lab/js/box',
		'examples/lab/js/propertyview',
		'examples/lab/js/pathables'
	],
	function(box, pview, pathables) {
		/* The floating box containing the list of clickable properties for a patricular Pathables collection.
		 *
		 * Required options:
		 * pathables: Pathables */

		var template = "<ul class='propitems'></ul>";
		var get_first = function(v) {
			if (_(v).isArray()) { return v[0]; }
			return v;
		};
		var PropertyBox = box.BoxView.extend({
			// events: {}, Fill out so clicking a property expands it and etc.
			initialize:function(options) {
				this.constructor.__super__.initialize.apply(this, [_({ item_container_class : "propitems" }).extend(options)]);
				var this_ = this;
				this.options.pathables
					.on("add", function(p) {
						console.log(" THINGY BEING ADDED > ", p, " - ", p.path.get("steps").models.length );
						p.on("dereference", function() { this_.render(); });
						this_.render(); 
					})
					.on("remove", function(p) { this_.render(p); });
				this.options.pathables.map(function(p) {p.on("dereference", function() { this_.render(); })	});
			},
			render:function() {
				var this_ = this;
				this.constructor.__super__.render.apply(this);
				this.$el.html(template);
				this.views_collection.reset();
				this.options.pathables.map(function(p) { this_._update_views(p); 	});				
				this.views_collection.map(function(pv) { console.log("pv > ", pv); this_._add_view(pv.attributes); });
				return this;
			},
			_update_views:function(pathable) {
				var this_ = this;
				var val = get_first(pathable.get_last_value());
				console.log("VAL IS ", val);
				if (val instanceof pathables.Pathable) {
					val.map(function(attribute, property) {
						if (property === "_id") { return; }
						if (!this_.views_collection.get(property)) {
							// this_.options.views_collection.add(new pview.PropertyView({
							var pv = new pview.PropertyView({
								property:property,
								pathables:this_.options.pathables
							});
							this_.views_collection.add(pv);
							pv.bind('click', function(p) { this_.trigger('property-click', p); });
						}
					});
				}
			},
		});

		return { PropertyBox:PropertyBox };
	}
);

