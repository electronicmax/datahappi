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
				var this_ = this;
				this.options.pathables.paths
					.on('add', function(path) {
						console.log("propertybox.pathables.path add >> ", path);
						var view = new pathview.PathView({
							pathables:this_.options.pathables,
							path:path
						});
						view.on("remove", function() {	this_.options.pathables.remove_path(path);	});
						this_.views_collection.add(view);
						this_.render();
						// we don't need to append because render will append everything this_.$el.append(view.render().el);
					}).on('remove', function(path) {
						console.log("propertybox.pathables.path remove path >> ", path);
						// TODO: find corresponding path in the view for this
						var view = this_.views_collection.filter(function(x) { return x.options.path == path; })[0];
						console.log("found apporpriate view >> ", view);
						view.remove();						
						this_.views_collection.remove(view);
						this_.render();
					});
			},
			render:function() {
				var this_ = this;
				this.$el.html("");				
				box.BoxView.prototype.render.apply(this, arguments);
				// create propitems class
				$("<ul class='propitems'></div>")
					.appendTo(this.$el)
					.sortable({
						change:function() {
							console.log("Pathviews Shuffled");
						},
						stop:function() {
							console.log(arguments);
						}
					}).disableSelection();
				
				this.views_collection.map(function(path_view) {
					this_.$el.find('.propitems')
						.append(path_view.render().el);
				});

				$("<div class='icon-list-add'></div>")
					.click(function(){ this_.add_path().render(); })
					.appendTo(this.$el);
				
				return this;
			},
			add_path:function(path) {
				/* Adds a new path and UI element to add steps to the path.
				 * @path: Optional; the path added to the pathables set and the UI, by default has no existing steps. */
				var this_ = this;
				path = path || new pathables.Path();
				this.options.pathables.add_path(path);				
				return this;
			},
			get_paths:function() {
				var paths = this.views_collection.map(function(prop_view) {
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

