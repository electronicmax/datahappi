define([],function() {
	var ToolbarView = Backbone.View.extend({
		template:"<div class='btn new_visual'>new visual</div>",
		className: 'toolbar',
		events: { 'click .btn' : '_click_button' },
		render:function() {
			this.$el.html(this.template);
			return this;
		},
		_click_button:function(evt, ui) {
			var this_ = this;
			var classes = _($(evt.target).attr('class').split(/\s+/)).without('btn');
			classes.map(function(c) { this_.trigger(c); })
		}
	});
	return {
		Toolbar:ToolbarView
	};
});
	   
