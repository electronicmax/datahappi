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
		var PropertyBox = box.BoxView.extend({
			initialize:function(options) {
				this.constructor.__super__.initialize.apply(this, [ _({ item_container_class : "propitems" }).extend(options) ]);
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
					this_.$el.find('ul').append(path_view.render().el);
				});

				var new_path_button = $("<button>+</button>");
				new_path_button.click(function(){ this_.add_path().render(); });
				this.$el.append(new_path_button);

				return this;
			},
			add_path:function(path) {
				/* Adds a new path and UI element to add steps to the path.
				 * @path: Optional; the path added to the pathables set and the UI, by default has no existing steps. */
				var this_ = this;
				path = path || new pathables.Path();
				this.options.pathables.add_path(path);
				var view = new pathview.PathView({
					pathables:this_.options.pathables,
					path:path
				});
				this.views_collection.add(view);

				return this;
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

