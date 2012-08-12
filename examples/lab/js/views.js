define(['examples/lab/js/pathables','js/utils', 'text!examples/lab/templates/pathableview.html'], function(pathables,utils, pathableview_templ) {
	// first attempt at ta
	var defined = utils.DEFINED;
	var CommonView = Backbone.View.extend({
		initialize:function() {
			this.setModel(this.options.model);
		},
		setModel:function(m) {
			var this_ = this;
			if (this.options.model) { this.options.model.off(null, null, this);	}
			m.on('all',function(eventName, x) {
				console.log(' CommonView >> got ', eventName, x);
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
			if (typeof(model_or_value) !== 'object') {	return model_or_value.valueOf();}
			if ( _(model_or_value).isDate() ) { return model_or_value.toString(); }
			if (typeof(model_or_value) == 'object' && !this._is_model(model_or_value) ) {return 'some object';  }
			
			// is model
			var m = model_or_value.toJSON();
			var lastpath = function(x) {
				if (x.indexOf('#') >= 0) {  return x.slice(x.lastIndexOf('#')+1); }
				return x.slice(x.lastIndexOf('/')+1);
			};
			var label = m['http://www.w3.org/2000/01/rdf-schema#label'];
			if (label && _(label).isString() && m._id) {
				label = label + " <a href='"+m._id+"'>src</a>";          
			} else if (label && _(label).isArray() && m._id) {
				label = label[0] + " <a href='"+m._id+"'>src</a>";       
			} else if (_(label).isUndefined() && m._id) {
				label = lastpath(m._id) + " <a href='"+m._id+"'>src</a>";
			} else if (_(label).isUndefined() && _(m).isObject()) {
				label = _(m).map(function(v,k){ return k+":"+v.valueOf().toString(); }).join(',');
			} else {
				label = m.valueOf().toString();
			}
			return label;			
		}
	});

	// show pathables in a lovely way
	var PathableView = CommonView.extend({
		template:pathableview_templ,
		className:'pathable-view item',
		events:{
			'click .delete' : '_cb_delete'
		},
		render:function() {
			var this_ = this;
			var m = this.options.model;
			var $template = $(this.template);
			var $lens_template = $template.find('#lens').clone().children();

			// step 0: set up shell if it doesn't exist
			if (!this.$el.html().length) {	this.$el.append($lens_template);	}

			this.$el.data('view',this); // for when someone drags us into a box
			// this.$el.data('model',this.options.model);
			this.$el.attr("data-uri", this.options.model.id);
			this.$el.draggable({revert:"invalid", helper:"clone", appendTo:'body'});			
			
			// step 1 > update name.
			this.$el.find('.name').html(this._get_label(m));

			// step 2 > update overall mode.
			if (!(m instanceof pathables.Pathable) || m.path.get('steps').length === 0) {
				// exit if we're not a model
				this._set_mode('root');
				return this;
			}
			
			this._set_mode('leaves');
		
			// step 3 > update values -- list of values at this level
			var $values = this.$el.find('.values');
			var val_template = $template.find('#value').children();
			var last_values = m.get_last_value();
			_(last_values).each(function(v, i) {
				var child =	$values.children()[i];
				if (_.isUndefined(child)) {
					child = val_template.clone().appendTo( $values );
				}
				$(child).html(this_._get_label(v));
				$(child).attr('data-val', this_._get_label(v));
				$(child).data('val', v);								
			});
			// exit selection
			$values.children().slice(last_values.length).map(function(v) {	v.remove(); });
			
			// update next properties
			var next_properties = _.uniq(utils.flatten(	m.get_last_value().map(function(lv) { return this_._props_of(lv); })));

			// instantiate template
			var prop_template = $template.find('#prop').children();
			var $props = this.$el.find('.props');
			// enter-update
			_(next_properties).each(function(np, i) {
				var child =	$props.children()[i];
				if (_.isUndefined(child)) {	child = prop_template.clone().appendTo( $props );	}
				child.find('.label').html(np);
				child.attr('data-prop', np);
			});
			$props.children().slice(next_properties.length).map(function(v) { v.remove(); });

			return this;			
		},
		_props_of:function(v) {
			// determines the properties of a particular value --
			if (v instanceof Backbone.Model) { return v.keys(); }
			return [];
		},
		_set_mode:function(r) {
			var e = this.$el;
			if (r == 'root') {
				e.find('.root').slideDown();
				e.find('.leaves').slideUp();
				return;
			}
			e.find('.root').slideUp();
			e.find('.leaves').slideDown();
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
			this.$el.data('model',this.options.model);
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
