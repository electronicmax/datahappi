define(
	[
		'examples/lab/js/pathables',
		'examples/lab/js/pathablecollection'
	],
	function(pathables, pathablecollection) {
		/* A selectable area showing a property which may be made the next step in a
		 * path for one or more pathables. When the path changes, the "change" event
		 *  fires and returns the new path as the first argument.
		 *
		 * Required options:
		 * pathables: pathables.Pathables */
		var PropertyView = Backbone.View.extend({
			initialize:function() {
				var this_ = this;
				this.property_view_chain = new PropertyViewChain({
					pathables:this_.options.pathables
				});

				// Whenever the visual combobox path is changed, trigger a change event.
				this.property_view_chain.on("change", function() {
					this_.trigger("change", this_.get_path());
				});

				this.coverage = 0;
			},
			render:function() {
				/*
				  this.$el.html(this.options.property);
				  this.$el.addClass(this._get_coverage_class());
				  this.$el.data("property", this.options.property);
				*/
				this.$el.html(this.property_view_chain.render().el);
				return this;
			},
			get_path:function() {
				return this.property_view_chain.get_path().filter(function(step) {
					return !_.isUndefined(step)
				});
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
					var step = new pathables.PropertyDereferenceStep({property:this_.prop_select.val()});
					var next_pathables = new pathables.Pathables(_.uniq(_.flatten(this_.options.pathables.map(function(pathable) {
						var path = pathable.try_step(step);
						if (path) {return _.last(path);}
					}))).filter(function(pathable) {
						// Remove undefined's and primitives
						return !_.isUndefined(pathable) && _.isObject(pathable);
					}));
					delete this_.next_chain_view;
					if (next_pathables.models.length > 0) {
						this_.next_chain_view = new PropertyViewChain_Subsequent({
							pathables:next_pathables
						});

						// Whenever the child combobox triggers a change event, pass it up.
						this_.next_chain_view.on("change", function() {
							this_.trigger("change")
						});
					}
					this_.render();
				});

				// When the select_model changed, remove and re-add all elements in the prop_select.
				this.select_model.on('change', function() {
					this_.prop_select.children().remove();
					// TODO: Once a value has been selected, remove 'extend chain...' and replace it with blank or somewhing, which deletes the box and all its children when selected.
					this_.prop_select.append("<option value='' class='no-path'>"+this_.initial_text+"</option>"); // Top option saying something like "Extend path..."
					_.map(this_.select_model.attributes, function(coverage, attribute) {
						// TODO: Order by coverage. (Pre-todo: fix coverage).
						this_.prop_select.append("<option value='"+attribute+"'>"+attribute+": "+coverage+"</option>");
					});
				});

				this.options.pathables
					.on("add", function(pathable) {this_._pathable_add(pathable);})
					.on("remove", function(pathable) {this_._pathable_remove(pathable);})
					.map(function(pathable) {
						this_._pathable_add(pathable);
					});

				// When a new option is selected, trigger a "change" event.
				this.prop_select.change(function(){
					this_.trigger("change");
				})
			},
			render:function() {
				var next_chain_link = this.next_chain_view ? this.next_chain_view.render().el : '';
				var html = $("<div></div>").append(this.prop_select).append(next_chain_link);
				this.$el.html(html);
				return this;
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
			},
			_pathable_add:function(pathable) {
				var this_ = this;
				_.union(_.keys(pathable.entailed || {}), _.keys(pathable.attributes)).filter(function(attribute) {
					return !(_.isUndefined(attribute) || attribute === "_id");
				}).map(function(attribute) {
					var model_attributes = {};
					model_attributes[attribute] = this_.options.pathables.coverage(attribute);
					this_.select_model.set(model_attributes);
				});
			},
			_pathable_remove:function(pathable) {
				// TODO
			},
			get_path:function() {
				var selectedOption = $(":selected", this.prop_select);
				if (_.isUndefined(selectedOption) || selectedOption.hasClass('no-path')) {
					return undefined
				} else {
					return this.next_chain_view ?
						[this.prop_select.val()].concat(this.next_chain_view.get_path()) :
						[this.prop_select.val()];
				}
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

