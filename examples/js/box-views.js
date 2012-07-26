define(['js/utils'], function(utils) {

	// first attempt at ta
	var ThingListItemView = Backbone.View.extend({
		tagName:'div',
		className:'instance',
		template:$('#thing-listitem-template').text(),
		events:{
			'dblclick .thing-label' : '_toggle_props'
		},
		initialize:function() {},
		render:function() {
			this.$el.html(
				_(this.options.template || this.template).template({m:this.options.model.toJSON()})
			);
			this.$el.data('view',this);
			this.$el.data('model',this.options.model);
			this.$el.attr("uri", this.options.model.id);
			return this;
		},
		_toggle_props:function() {
			console.log('doubleclick');
			if (this.$el.find('.props:hidden').length) {
				this.$el.find('.props').slideDown();
			} else {
				this.$el.find('.props').slideUp();
			}
		}
	});

	return { ThingListItemView : ThingListItemView };

});