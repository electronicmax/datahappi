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
				this.constructor.__super__.initialize.apply(this, [ _({ item_container_class : "propitems" }).extend(options) ]);
				var this_ = this;

				// TODO: Replace this with a button which, when clicked, adds new pathviews.
				var initial_path = new pathables.Path();
				this.options.pathables.add_path(initial_path);
				var initial_view = new pathview.PathView({
					pathables:this_.options.pathables,
					path:initial_path
				});
				this.views_collection.add(initial_view);
			},
			render:function() {
				var this_ = this;
				box.BoxView.prototype.render.apply(this, arguments);

				var html =	"<div class='uplt'></div>";
				html += 	"<div class='uprt'></div>";
				html += 	"<div class='btlt'></div>";
				html +=		"<div class='btrt'></div>";

				html += "<ul class='propitems'></ul>";
				this.$el.html(html);

				this.views_collection.map(function(path_view) {
					return this_.$el.find('ul').append(path_view.render().el);
				});

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

