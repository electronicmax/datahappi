define(['js/utils'], function(utils) {
	// first attempt at ta
	var ThingListItemView = Backbone.View.extend({
		idAttribute:"model_id",
		tagName:'div',
		className:'item',
		template:$('#thing-listitem-template').text(),
		events:{
			'dblclick .thing-label' : '_toggle_props',
			'click .delete' : '_cb_delete'
		},
		initialize:function() {
			this.setModel(this.options.model);
		},
		setModel:function(m) {
			var this_ = this;
			if (this.options.model) {
				this.options.model.off(null, null, this);
			}
			m.on('change dereference',function() { this_._update_template(); }, this);
			m.on('all',function(eventName, x) { this_.trigger(eventName, x);}, this);
			this.options.model = m;			
		},
		_update_template:function() {
			var val = this.options.model.get_last_value();
			if (val.toJSON) { val = val.toJSON(); }
			if (_(val).isArray()) { val = val[0]; }
			if (val.toJSON) { val = val.toJSON(); }
			this.$el.html(_(this.options.template || this.template).template({m:val}));
		},
		render:function() {
			this._update_template();
			this.$el.data('view',this);
			this.$el.data('model',this.options.model);
			this.$el.attr("uri", this.options.model.id);
			this.$el.draggable({
				revert:"invalid", helper:"clone", appendTo:'body'
			});
			return this;
		},
		_toggle_props:function() {
			if (this.$el.find('.props:hidden').length) {
				this.$el.find('.props').slideDown();
			} else {
				this.$el.find('.props').slideUp();
			}
		},
		_cb_delete:function() {
			this.trigger('delete');
			this.options.model.off(null, null, this);
		}
	});

	return { ThingListItemView : ThingListItemView };
});
