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
				this.property_view_chain = new PropertyViewChain({
					pathables:this_.options.pathables
				});
			},
			render:function() {
				this.$el.html(this.property_view_chain.render().el);
				return this;
			}
		});

		var PropertyViewElement = Backbone.View.extend({
			initialize:function() {
				var this_ = this;
				this.next_chain_view = undefined;

				this.prop_select = $("<select></select>");
				// When a new value is selected, set the next link accordingly.
				this.prop_select.change(function() {
					console.log(this_.prop_select.val());
					// TODO: next_pathables <- the pathables which have been chained on this.options.pathables witht he attribute this.prop_select.val()
					var next_pathables = this_.options.pathables;
					this.next_chain_view = new PropertyViewChain_Subsequent({
						pathables:next_pathables
					});
				});
				this.select_model = new Backbone.Model();

				// When the select_model changed, remove and re-add all elements in the prop_select.
				this.select_model.on('change', function() {
					this_.prop_select.children().remove();
					// TODO: Once a value has been selected, remove 'extend chain...' and replace it with blank or somewhing, which deletes the box and all its children when selected.
					this_.prop_select.append("<option value=''>"+this_.initial_text+"</option>");
					_.map(this_.select_model.attributes, function(coverage, attribute) {
						// TODO: Order by coverage.
						this_.prop_select.append("<option value='"+attribute+"'>"+attribute+": "+coverage+"</option>");
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
				var next_chain_link = this.next_chain_view ? this.next_chain_view.render().el : '';
				this.$el.html(this.prop_select.after(next_chain_link));
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

		var PropertyViewChain = PropertyViewElement.extend({
			initial_text:"New chain..."
		});

		var PropertyViewChain_Subsequent = PropertyViewElement.extend({
			initial_text:"Extend chain..."
		});

		return {
			PropertyView:PropertyView
		};
	}
);

