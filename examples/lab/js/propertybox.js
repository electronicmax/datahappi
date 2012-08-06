define(
	[
		'examples/lab/js/box',
		'examples/lab/js/propertyview',
		'examples/lab/js/pathables'
	],
	function(box, propview, pathables) {
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
				this.constructor.__super__.initialize.apply(this, [ _({ item_container_class : "propitems" }).extend(options)]);
				var this_ = this;
				this.options.pathables
					.on("add", function(p) {
						// new pathable was added, so update ourselves
						console.log(" THINGY BEING ADDED > ", p, " - ", p.path.get("steps").models.length );
						// register interest in future dereferences of it
						p.on("dereference", function() { this_.render(); });
						this_.render(); 
					})
					.on("remove", function() { this_.render(); });
				this.options.pathables.paths.on("add remove pathchange", function(x) {
					console.log('pathchange', x);
					this_.render();
				});
				this.options.pathables.map(function(p) { p.on("dereference", function() { this_.render(); }); });
			},
			render:function() {
				var this_ = this;
				box.BoxView.prototype.render.apply(this, arguments);
				this.$el.html(template);
				this.views_collection.reset();
				this.views_collection.add(new propview.PropertyView({pathables:this_.options.pathables}));
				this.views_collection.map(function(pv) { this_._add_view(pv.attributes); });

				return this;
			},
			_update_views:function(pathable) {
				var this_ = this;
				console.log('dealing with pathable ', pathable.id, pathable.path.get('steps').length, pathable.values.length, pathable.path.get('steps').map(function(x) { return x.id; }), pathable.get_last_value());
				var val = get_first(pathable.get_last_value());
				if (val instanceof pathables.Pathable) {
					val.map(function(attribute, property) {
						if (property === "_id") { return; }
						if (!this_.views_collection.get(property)) {
							var pv = new propview.PropertyView({
								property:property,
								pathables:this_.options.pathables
							});
							this_.views_collection.add(pv);
							pv.bind('click', function(p) { this_.trigger('property-click', p); });
						} else {
							var view = this_.views_collection.get(property).attributes;
							view.setCoverage(view.coverage+1);
						}
					});
				}
			}
		});

		return { PropertyBox:PropertyBox };
	}
);

