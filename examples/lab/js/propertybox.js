define(
	[
		'examples/lab/js/box',
		'examples/lab/js/pathview',
		'examples/lab/js/pathables'
	],
	function(box, pathview, pathables) {
		/* The floating box containing the list of clickable properties for a patricular Pathables collection.
		 *
		 * Required options:
		 * pathables: Pathables */
		var get_first = function(v) {
			if (_(v).isArray()) { return v[0]; }
			return v;
		};
		var PropertyBox = box.BoxView.extend({
			initialize:function(options) {
				this.constructor.__super__.initialize.apply(this, [ _({ item_container_class : "propitems" }).extend(options)])
				var this_ = this;

				// TODO: Replace this with a button which, whebn clicked, adds new pathviews.
				var initial_path = new pathables.Path();
				this.options.pathables.add_path(initial_path);
				var initial_view = new pathview.PathView({
					pathables:this_.options.pathables,
					path:initial_path
				});
				this.views_collection.add(initial_view);

				/* This can be handled in individual pathviews.
				this.options.pathables
					.on("add", function(p) {
						// new pathable was added, so update ourselves
						console.log("propertybox::add > ", p, " - ", p.path.get("steps").models.length );
						// register interest in future dereferences of it
						p.on("dereference", function() { this_.render(); }, this_);
						this_.render();
					}).on("remove", function(x) {
						this_.render();
						x.off(null, null, this_);
					});
				this.options.pathables.paths.on("add remove pathchange", function(x) { this_.render();	});
				this.options.pathables.map(function(p) { p.on("dereference", function() { this_.render(); }); });
				*/
			},
			render:function() {
				var this_ = this;
				box.BoxView.prototype.render.apply(this, arguments);

				var html =	"<div class='uplt'></div>";
				html += 	"<div class='uprt'></div>";
				html += 	"<div class='btlt'></div>";
				html +=		"<div class='btrt'></div>";

				html += "<ul class='propitems'>";
				html += this.views_collection.map(function(path_view) {
					return path_view.render().el.innerHTML;
				}).join('');
				html += "</ul>";

				this.$el.html(html);
				/*
				this.views_collection.reset();

				//this.options.pathables.map(function(p) { this_._update_views(p); }); Replaced this with line below, which was how it originaly was; should probably look into further.
				var new_path = new pathables.Path();
				this.options.pathables.add_path(new_path);
				var new_view = new pathview.PathView({
					pathables:this_.options.pathables,
					path:new_path
				});
				new_view.on("change", function(path) {
					this_.trigger("change", path);
				});

				this.views_collection.add(new_view);
				this.views_collection.map(function(pv) { this_._render_view(pv); });

				// this.options.pathables.map(function(p) { this_._update_views(p); });
				*/

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
							var view = this_.views_collection.get(property);
							view.setCoverage(view.coverage+1);
						}
					});
				}
			},
			get_paths:function() {
				paths = this.views_collection.map(function(prop_view) {
					return prop_view.attributes.get_path();
				}).filter(function(path) {
					return (path.get_steps().length > 0);
				});

				return new pathables.Paths(paths);
			}
		});

		return { PropertyBox:PropertyBox };
	}
);

