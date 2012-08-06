define(['js/utils'], function(utils) {
	// first attempt at ta
	var ThingListItemView = Backbone.View.extend({
		tagName:'div',
		className:'item',
		template:$('#thing-listitem-template').text(),
		events:{
			'dblclick .thing-label' : '_toggle_props'
		},		
		initialize:function() {
			var this_ = this;
			this.options.model.bind('dereference',function() {
				this_._update_template();
			});
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
			this.$el.draggable({
				revert:"invalid", helper:"clone", appendTo:'body',
			});
			return this;
		},
		_toggle_props:function() {
			if (this.$el.find('.props:hidden').length) {
				this.$el.find('.props').slideDown();
			} else {
				this.$el.find('.props').slideUp();
			}
		}
	});

	return { ThingListItemView : ThingListItemView };

});
