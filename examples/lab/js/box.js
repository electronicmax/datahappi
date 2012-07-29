define([], function() {


	var clone_view = function(src_view) {
		// makes a new view from the same model as src_model
		var view = new src_view.constructor(src_view.options);
		view.render();
		return view;
	};
	var BoxView = Backbone.View.extend({
		tagName:'div',
		className:'greybox',
		initialize:function() {
			this.views_collection = this.options.views_collection ? this.options.views_collection : new Backbone.Collection();
		},
		setTopLeft:function(top,left) {
			this.$el.css("top",top).css("left",left);
		},
		render:function() {
			return this;
		},
		_add_view:function(v) {
			// requires there be an 'items' subelement under us.
			this.$el.find('.items').append(v.render().el);
		},
		add:function(v) {
			this.views_collection.add(v);
			this._add_view(v);
		},
		show:function() {
			console.log("Unhiding Box");
		},
		hide:function() {
			console.log("Hiding Box");
		}
	});
	return {
		BoxView : BoxView,
		clone_view : clone_view
	};
});
