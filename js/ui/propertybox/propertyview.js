define(
	[
		'js/pathables',
		'js/ui/propertybox/pathablecollection'
	],
	function(pathables, pathablecollection) {
		/* A selectable area showing a property which may be made the next step in a
		 * path for one or more pathables.
		 *
		 * Required options:
		 * property: String
		 * pathables: pathables.Pathables */
		var PropertyView = Backbone.View.extend({
			events: {
				'click .propmodel' : '_propclick'
			},
			tagName:"div",
			className:"property-view",
			template:"<div class='propmodel'><%= _id %><div class='coverage-container'><div class='coverage'></div></div><div class='entropy-container'><div class='entropy'></div></div></div>",
			initialize:function() {
				this.id = this.property;

				this.pathable_collection = new pathablecollection.PathableCollection({}, {
					property:this.options.property,
					pathables:this.options.pathables
				});
			},
			render:function() {
				this.el = this.options.property+" "+this.options.pathables.coverage+" "+this.options.pathables.entropy+"<br>";
				/*
				this.$el.html(_(this.template).template(this.pathable_collection.toJSON()));
				this.$el.data("view", this);
				this.$el.data("model", this.options.model);
				*/
				return this;
			},
			_propclick: function(x) {
				// Loads has changed - I doubt this works anymore.
				// this.options.collection.chain_forwards(this.options.model.get("_id"));
			}
		});

		return { 
			PropertyView:PropertyView
		};
	}
);

