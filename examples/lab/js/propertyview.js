define(
	[
		'examples/lab/js/pathables',
		'examples/lab/js/pathablecollection'
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
				'click' : '_propclick'
			},
			tagName:"li",
			initialize:function(options) {
				this.id = options.property;
				console.log("this id is ", this.id);
				this.pathable_collection = new pathablecollection.PathableCollection({}, {
					property:this.options.property,
					pathables:this.options.pathables
				});
				this.coverage = 0;
			},
			render:function() {
				this.$el.html(this.options.property);
				this.$el.addClass(this._get_coverage_class());
				this.$el.data("property", this.options.property);
				return this;
			},
			_propclick: function(x) {
				// Loads has changed - I doubt this works anymore.
				// this.options.collection.chain_forwards(this.options.model.get("_id"));
				this.trigger('click', this.options.property);
			},
			_get_coverage_class:function() {
				var c = this.coverage;
				if (c < 2) { return 'coverage-small'; }
				else if (c < 5) { return 'coverage-medium'; }
				return 'coverage-large';
			},
			setCoverage:function(c) {
				this.coverage = c || 0;
				console.log('>>>>> --- setting coverage ', this.coverage);
			}
		});
		return { 
			PropertyView:PropertyView
		};
	}
);

