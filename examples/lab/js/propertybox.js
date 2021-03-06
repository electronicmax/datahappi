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
						var view = new pathview.PathView({
							pathables:this_.options.pathables,
							path:path
						});
						view.on("remove", function() {	this_.options.pathables.remove_path(path);	});
						this_.views_collection.add(view);
						this_.render();
						// we don't need to append because render will append everything this_.$el.append(view.render().el);
					}).on('remove', function(path) {
						// TODO: find corresponding path in the view for this
						var view = this_.views_collection.filter(function(x) { return x.options.path == path; })[0];
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
				$("<ul class='propitems'></ul>")
					.appendTo(this.$el)
					.sortable({
						stop:function(evt,ui) {
							this_.$el.find('.path').each(function(x) {
								var view = $(this).data('view');
								view.path.set({path_priority:x}, {silent:true});
							});
							// things actually don't sort on property change :'( 
							this_.options.pathables.paths.sort();
							this_.options.pathables.paths.trigger('change');							
						}
					}).disableSelection();
				
				this.views_collection.map(function(path_view) {
					this_.$el.find('.propitems')
						.append(path_view.render().el);
				});

				$("<div class='new-path-btn icon-list-add'></div>")
					.click(function(){ this_.add_path().render(); })
					.appendTo(this.$el);

				var b = 22 + 22*(Math.max(0,this.views_collection.length - 1));
				console.log('setting height of property box to be ', b);
				this.$el.height(b);
				this.$el.parent().find('.items').css('bottom', b);
				return this;
			},
			add_path:function(path) {
				/* Adds a new path and UI element to add steps to the path.
				 * @path: Optional; the path added to the pathables set and the UI, by default has no existing steps. */
				// console.log("Priority before add: ",this.options.pathables.paths.map(function(path) {
				// 	return path.get_steps();
				// }));
				path = path || new pathables.Path();
				this.options.pathables.add_path(path);
				// console.log("Priority after add: ",this.options.pathables.paths.map(function(path) {
				// 	return path.get_steps();
				// }));
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

