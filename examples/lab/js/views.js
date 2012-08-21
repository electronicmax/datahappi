define(['js/models', 'examples/lab/js/pathables','js/utils', 'text!examples/lab/templates/pathableview.html'], function(models,pathables,utils, pathableview_templ) {
	var defined = utils.DEFINED;

	var CommonView = Backbone.View.extend({
		initialize:function() {
			this.setModel(this.options.model);
		},
		setModel:function(m) {
			var this_ = this;
			if (this.options.model) { this.options.model.off(null, null, this);	}
			m.on('all',function(eventName, x) {
				this_.render();
				this_.trigger(eventName, x);
			}, this);
			this.options.model = m;			
		},
		_cb_delete:function() {
			var this_ = this;
			this.trigger('delete');
			this.options.model.off(null, null, this);
			this.$el.fadeOut('fast', function() { this_.$el.remove(); });
		},
		_is_model:function(model_or_value) {
			return model_or_value instanceof Backbone.Model && defined(model_or_value.id);
		},
		_get_label:function(model_or_value) {
			var this_ = this;
			if (model_or_value instanceof models.Maxel) { return model_or_value.get_label(); }
			if (_(model_or_value).isArray()) {
				return model_or_value.map(function(mv) { return this_._get_label(mv); }).join(',');
			}
			if (typeof(model_or_value) !== 'object') {return model_or_value.valueOf();}			
			if ( _(model_or_value).isDate() ) { return model_or_value.toString(); }
			if (typeof(model_or_value) == 'object' && !this._is_model(model_or_value) ) { return 'some object';  }
			throw new Error("I dont know what to do!");
		}
	});

	// show pathables in a lovely way
	var PathableView = CommonView.extend({
		template:pathableview_templ,
		className:'pathable-view',
		events:{
			'click .delete' : '_cb_delete',
			'click .proplabel' : '_prop_select'
		},
		render:function() {
			var this_ = this;
			var m = this.options.model;
			var $template = $(this.template);
			var $lens_template = $template.find('#lens').clone().children();

			// step 0: set up shell if it doesn't exist
			if (!this.$el.html().length) {
				this.$el.append($lens_template);
				this._add_sameas_behaviour(this.$el);
			}

			this.$el.data('view',this); // for when someone drags us into a box
			this.$el.data('model', function() { return this_.options.model; });
			this.$el.attr("data-uri", this.options.model.id);
			this.$el.draggable({revert:"invalid", helper:"clone", appendTo:'body'});
			
			// step 1 > update name.
			this.$el.find('.name').html(this._get_label(m.get_base_model()));

			// step 3 > update values -- list of values at this level
			var $values = this.$el.find('.values');

			// step 2 > update overall mode.
			if (!(m instanceof pathables.Pathable) || m.path.get('steps').length === 0) {
				// standalone
				$values.html('');
			} else {
				var val_template = $($template.find('#value').children()[0]);
				var last_values = m.get_last_value();				
				_(last_values).each(function(v, i) {
					var child =	$values.children()[i];
					if (_.isUndefined(child)) {
						child = val_template.clone().appendTo( $values );
					}
					$(child).html(this_._get_label(v));
					$(child).attr('data-val', this_._get_label(v)); // for brushing
					if (v instanceof models.Maxel) {
						// then it can be accepted by other instanceboxes
						$(child).data('model', function() { return new pathables.Pathable({model:v}); });					
						$(child).addClass('dereferenced-model');
					} else {
						// primitive value, so shoudn't be supported in dnd
						$(child).removeClass('dereferenced-model');
					}
					$(child).draggable({revert:"invalid", helper:"clone", appendTo:'body'});
				});
				// exit selection
				$values.children().slice(last_values.length).map(function(v) { $(this).remove(); });
			}			
			
			// update next properties
			var next_properties = _.uniq(utils.flatten(	m.get_last_value().map(function(lv) { return this_._props_of(lv); })));

			// instantiate template
			var prop_template = $template.find('#prop').children();
			var $props = this.$el.find('.props');
			// enter-update
			_(next_properties).each(function(np, i) {
				var child =	$props.children()[i];
				if (_.isUndefined(child)) {
					child = prop_template.clone().appendTo( $props );
				}
				$(child).html(np);
				$(child).attr('data-prop', np);
			});
			$props.children().slice(next_properties.length).map(function() { $(this).remove(); });
			return this;			
		},
		_prop_select:function(p) {	this.trigger('property-click', p);	},
		_props_of:function(v) {
			// determines the properties of a particular value --
			if (v instanceof Backbone.Model) { return v.keys(); }
			return [];
		},
		_add_sameas_behaviour:function() {
			// make _el_ droppable -- with a clear warning
			var this_ = this;
			var highlight = function($el) { $el.addClass('sameas-over'); };
			var unlight = function($el) { $el.removeClass('sameas-over'); };
			
			this.$el.find('.sameas-handle')
				.add(this.$el.find('.values').children())
				.droppable({
					greedy:true, // magical nesting of droppables
					accept:'.item,.pathable-view,.dereferenced-model',
					tolerance:"touch",
					over:function(event, ui) {
						var thismodel = this_.options.model;
						var thatmodel = ui.draggable.data("model")();
						if (thismodel.id !== thatmodel.id) {
							highlight($(ui.draggable));
							// highlight($(event.target));							
							highlight(this_.$el);
							highlight($(this));
						} else {
							unlight(this_.$el);
							// unlight($(event.target));
							unlight($(this));
							unlight($(ui.draggable)); 
						}
					},
					out:function(event, ui) {
						unlight($(event.target));						
						unlight($(ui.draggable));
						unlight(this_.$el);
						unlight($(this));						
					},
					drop: function( event, ui ) {
						console.log('drop ', event, ui);
						var thismodel = this_.options.model.model;
						var thatmodel = ui.draggable.data("model")().model;
						if (thismodel.id !== thatmodel.id) {
							unlight($(event.target));						
							unlight($(ui.draggable));
							unlight(this_.$el);
							unlight($(this));													
							thismodel.setSameAs(thatmodel);
						}
					}
				});
		}
	});
	
	var ThingListItemView = CommonView.extend({
		tagName:'div',
		className:'item',
		template:$('#thing-listitem-template').text(),
		events:{
			'click .delete' : '_cb_delete'
		},		
		_update_template:function() {
			var val = this.options.model.get_last_value();
			if (val.toJSON) { val = val.toJSON(); }
			if (_(val).isArray()) { val = val[0]; }
			if (val.toJSON) { val = val.toJSON(); }
			this.$el.html(_(this.options.template || this.template).template({m:val}));
		},
		render:function() {
			var this_ = this;
			this._update_template();			
			this.$el.data('view',this);
			this.$el.data('model',function() { return this_.options.model; });
			this.$el.attr("uri", this.options.model.id);
			this.$el.draggable({revert:"invalid", helper:"clone", appendTo:'body'});
			return this;
		}
	});

	return {
		PathableView : PathableView,
		ThingListItemView : ThingListItemView
	};
});
