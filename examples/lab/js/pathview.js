define(
	[
		'examples/lab/js/pathables'
	],
	function(pathables) {
		"use strict";

		/* @pathables:	Pathables collection belonging to the instancebox.
		 * @path:		The path this view displays/modifies. */
		var PathView = Backbone.View.extend({
			template:_.template($('#pathview-template').html()),
			tagName:'li',
			className:'path',
			initialize:function() {
				var this_ = this;
				this.pathables = this.options.pathables;
				this.path = this.options.path;
				this.position = this.pathables.paths.length;
				this.pathables
					.on("add remove", function(args) { this_.render(args); });
				this.pathables.paths
					.on("all", function(eventType, args) {
						this_.render();
					});
			},
			render:function() {
				var this_ = this;
				var path_values = this.pathables.try_path(this.path) || [];
				var next_steps = _.uniq(_.flatten(path_values.map(function(pathable_array) {
					var next_object = _.last(pathable_array)[0];
					return next_object instanceof pathables.Pathable ? next_object.entailedKeys() : undefined;
				})).filter(function(pathable) {
					return !_.isUndefined(pathable);
				}));

				var previous_steps = this.path.get_steps().models.map(function(step_model) {
					return step_model.get("property");
				});

				this.$el.html(this.template({
					previous_steps:previous_steps,
					next_steps:next_steps
				}));

				this.$el.find(".next-step-select").change(function() {
					this_.path_extend().render();
				});

				this.$el.find(".delete").click(function() { this_.path_remove(); });

				return this;
			},
			path_extend:function() {
				var selected_val = this.$el.find(":selected").val();

				if (!_.isUndefined(selected_val)) {
					var step = new pathables.PropertyDereferenceStep({
						property:selected_val
					});
					this.path.add_step(step);
				}

				return this;
			},
			path_remove:function() {
				// Removal is the responsibility of the containing propertybox.
				this.trigger("remove");
				return this;
			},
			path_move:function() {
				// TODO: Change the position of the path.
				return this;
			}
		});

		return { PathView:PathView };
	}
);
