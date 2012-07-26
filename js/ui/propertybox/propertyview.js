define(
	[
		'js/ui/propertybox/propertycollection',
		'js/pathables'
	],
	function(pc, pathables) {
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
				var this_ = this;
				this.property_collection = new pc.PropertyCollection();
				this.options.model.bind("change:coverage", function() { this_._update_coverage(); });
				this.options.model.bind("change:entropy", function() { this_._update_entropy(); });
			},
			render:function() {
				this.$el.html(_(this.template).template(this.options.model.toJSON()));
				this.$el.data("view", this);
				this.$el.data("model", this.options.model);
				this._update_coverage();
				this._update_entropy();
				return this.el;
			},
			_update_coverage:function() {
				var c = this.options.model.get('coverage');
				this.$el.find('.coverage').css('right',(this.$el.width() * (1-c))+"px");
			},
			_update_entropy:function() {
				var e = this.options.model.get('entropy');
				this.$el.find('.entropy').css('right',(this.$el.width() * (1-e))+"px");
			},
			_propclick: function(x) {
				this.options.collection.chain_forwards(this.options.model.get("_id"));
			}
		});

		return { 
			PropertyView:PropertyView
		};
	}
);

