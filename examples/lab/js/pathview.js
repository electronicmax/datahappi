define(
	[
		'examples/lab/js/pathables',
		'js/utils'		
	],
	function(pathables, utils) {
		"use strict";

		var defined = utils.DEFINED, flatten = utils.flatten;

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
				this.path
					.on("all", function(eventType, args) { this_.render();	});
			},
			render:function() {
				var this_ = this;
				var last_values = _(flatten(
					this.pathables.try_path(this.path)
						.map(function(pathable_path) {
							console.log('pathable path is ', pathable_path, ' retuerning ', _(pathable_path).last());
							return _(pathable_path).last();
						}))).uniq();
				var next_steps = _.uniq(_.flatten(last_values.map(function(value) {
					return value.keys ? value.keys() : []; 
				})));
				console.log(" NEXT STEPS >>>>>>>>>>>>>>>>>>>>>>>>>>>", next_steps);
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

				/* 
				this.$el.on("reorder", function(e, index) {
					console.log("Before reorder: ", this_.pathables.paths.map(function(path) {
						return "path: " + path.get('steps').map(function(x) { return x.get('property'); }) + " pri : " +  path.get("path_priority"); 
					}));
					// this_.pathables.paths.remove(this_.path);
					// this_.pathables.paths.insertAt(this_.path, index);
					console.log("After ", this_.pathables.paths.map(function(path) {
						return "path:" + path.get('steps').map(function(x) { return x.get('property'); }) + " pri : " +  path.get("path_priority"); 
					}));
				});
				*/

				// put a pointer from the DOM back to us so that the shuffler
				// can find us out
				this.$el.data("view", this);
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
