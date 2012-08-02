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
		 * pathables: pathables.Pathables */
		var PropertyView = Backbone.View.extend({
			initialize:function() {
				var this_ = this;
				this.prop_select = $("<select></select>");
				this.prop_select.change(function() {
					console.log(this_.prop_select.val());
				});
				this.select_model = new Backbone.Model();

				// When the select_model changed, remove and re-add all elements in the prop_select.
				this.select_model.on('change', function() {
					this_.prop_select.children().remove();
					_.map(this_.select_model.attributes, function(coverage, attribute) {
						// TODO: Order by coverage.
						this_.prop_select.append("<option>"+attribute+": "+coverage+"</option>");
					});
				});

				this.options.pathables
					.on("add", function(pathable) {this_._pathable_add(pathable);})
					.on("remove", function(pathable) {this_._pathable_remove(pathable);})
					.map(function(pathable) {
						this_._pathable_add(pathable);
					});
			},
			render:function() {
				this.$el.html(this.prop_select);
				/*
				this.$el.html(this.options.property);
				this.$el.addClass(this._get_coverage_class(this.coverage));
				this.$el.data("property", this.options.property);
				*/
				return this;
			},
			_pathable_add:function(pathable) {
				var this_ = this;
				_.union(_.keys(pathable.entailed), _.keys(pathable.attributes)).filter(function(attribute) {
					return !(_.isUndefined(attribute) || attribute === "_id");
				}).map(function(attribute) {
					var model_attributes = {};
					model_attributes[attribute] = this_.options.pathables.coverage(attribute);
					this_.select_model.set(model_attributes);
				});
			},
			_pathable_remove:function(pathable) {
				// TODO
			}
		});

		var InitialPropertyView = Backbone.View.extend({

		});

		return {
			PropertyView:PropertyView
		};
	}
);

