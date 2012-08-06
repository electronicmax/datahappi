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

				this.prop_select = $("<select></select>");	// The combobox listing all avaliable properties for the next step in a chain.
				this.select_model = new Backbone.Model();	// The conceptual model behind the combobox.

				// When a new value is selected, set the next link accordingly.
				this.prop_select.change(function() {
					console.log(this_.prop_select.val());
					// TODO: next_pathables <- the pathables which have been chained on this.options.pathables witht he attribute this.prop_select.val()
					var next_pathables = this_.options.pathables;
					this_.next_chain_view = new PropertyViewChain_Subsequent({
						pathables:next_pathables
					});
					console.log("next_chain_view: "+this_.next_chain_view);
					this_.render();
				});

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
				var html = $("<div></div>").append(this.prop_select).append(next_chain_link);
				this.$el.html(html);
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
			PropertyView:PropertyView,
			PropertyViewElement:PropertyViewElement,
			PropertyViewChain:PropertyViewChain,
			PropertyViewChain_Subsequent:PropertyViewChain_Subsequent
		};
	}
);

