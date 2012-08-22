define([],function() {
	var ToolbarView = Backbone.View.extend({
		template:"<div class='btn new_visual icon-signal'></div> <div class='btn new_map icon-google-circles'></div>",
		className: 'toolbar',
		events: { 'click .btn' : '_click_button' },
		render:function() {
			this.$el.html(this.template);
			return this;
		},
		_click_button:function(evt, ui) {
			var this_ = this;
			var classes = _($(evt.target).attr('class').split(/\s+/)).without('btn').filter(function(x) { return x.indexOf('icon') < 0; });
			classes.map(function(c) { this_.trigger(c); });
		}
	});
	return {
		Toolbar:ToolbarView
	};
});
