define(
	[
		'examples/lab/js/pathables',
	],
	function(pathables, pathablecollection) {
		"use strict";

		/* @pathables:	Pathables collection belonging to the instancebox.
		 * @path:		The path this view displays/modifies. */
		var PathView = Backbone.View.extend({
			template:_.template($('#pathview-template').html()),
			initialize:function() {
				this.pathables = this.options.pathables;
				this.path = this.options.path;
				this.position = this.pathables.paths.length;
			},
			render:function() {
				var this_ = this;
				var next_steps = _.uniq(_.flatten(this.pathables.try_path(this.path).map(function(pathable_array) {
					return pathable_array.map(function(pathable) {
						return pathable[0].entailedKeys();
					});
				})));

				var previous_steps = this.path.get_steps().models.map(function(step_model) {
					return step_model.id;
				});

				var html = this.template({
					previous_steps:previous_steps,
					next_steps:next_steps
				});

				this.$el.html(html);

				this.$(".next-step-select").change(function() { this_.path_extend().render(); });

				return this;
			},
			path_extend:function() {
				var selected_val = this.$(":selected").val();

				if (!_.isUndefined(selected_val)) {
					this.path.add_step(new pathables.PropertyDereferenceStep({
						property:selected_val
					}));
				}

				return this;
			},
			path_remove:function() {
				return this;
			},
			path_move:function() {
				// Change the position of the path.
				return this;
			}
		});

		return { PathView:PathView };
	}
);
