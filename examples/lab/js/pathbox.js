define(
	[
		'examples/lab/js/box',
		'examples/lab/js/pathables'
	],
	function(box, pathables) {
		/* The box containing the ordered list of complete paths taken for a single Pathables set.
		 *
		 * Required options:
		 * pathables: Pathables */

		var template = "<ul class='pathitems'></ul>";
		var PathBox = box.BoxView.extend({
			initialize:function(options) {
				var this_ = this;
				this.constructor.__super__.initialize.apply(this, [_({ item_container_class : "pathitems" }).extend(options)]);
				this.views_collection.add(new PathView({pathables:this.options.pathables}));
			},
			render:function() {
				var this_ = this;
				this.constructor.__super__.render.apply(this);
				this.$el.html(template);
				this.views_collection.reset();
				this.options.pathables.map(function(p) { this_._update_views(p); });
				this.views_collection.map(function(pv) { console.log("pv > ", pv); this_._add_view(pv.attributes); });
				return this;
			},
			_update_views:function() {
				var this_ = this;
				var newPaths = this.options.pathables.get_paths();

				var pathsToAdd = _.difference(newPaths, this.paths);
				var pathsToRemove = _.difference(this.paths, newPaths);

				pathsToRemove.map(function(path) {
					this_.views_collection.remove(path);
					// TODO: Make additions/deletions silent and fire single change at the end?
					// this_.views_collection.remove(path, {silent:true});
				});

				pathsToAdd.map(function(path) {
					this_.views_collection.add(new PathView({path:path}));
				});
				this.paths = _.union(this.paths, newPaths);
			}
		});

		/* A view showing a single path of a Pathables collection.
		 *
		 * Required options:
		 * pathables: pathables.Pathables
		 * property: String */
		var PathView = Backbone.View.extend({
			className:"path-view",
			initialize:function(options) {
				this.render();
			},
			render:function() {
				var this_ = this;
				this.el = "-> <select><option>Extend path...</option>";
				var options = _.uniq(_.flatten(this.options.pathables.map(function(pathable) {
					var next_pathable = pathable.get(this_.options.property);
					if (next_pathable instanceof pathables.Pathable) {
						return next_pathable.attributes;
					} else {
						return;
					}
				})).filter(function(option) {
					return !_.isUndefined(option);
				})).map(function(attribute) {
					return "<option>"+attribute+"</option>";
				}).join("\n");
				this.el += options;
				this.el += "</select>";
				return this;
			}
		});

		return {
			PathBox:PathBox,
			PathView:PathView
		};
	}
);

