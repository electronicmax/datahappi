define([], function() {


	var clone_view = function(src_view) {
		// makes a new view from the same model as src_model
		var view = new src_view.constructor(src_view.options);
		view.render();
		return view;
	};
	var BoxView = Backbone.View.extend({
		tagName:'div',
		defaults: { item_container_class : 'items' },
		initialize:function(options) {
			this.options = _({}).extend(this.defaults, options);
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
			console.log('adding to ', this.options.item_container_class);
			this.$el.find("." + this.options.item_container_class).append(v.render().el);
		},
		add:function(v) {
			this.views_collection.add(v);
			this._add_view(v);
		},
		show:function() {
			if (this.$el.is(":hidden")) { this.$el.slideDown(); }
		},
		hide:function() {
			if (!this.$el.is(":hidden")) {	this.$el.slideUp();  }
		},
		toggle_visibility:function() {
			if (this.$el.is(":hidden")) { this.$el.slideDown(); } else { this.$el.slideUp(); }
		}
	});
	return {
		BoxView : BoxView,
		clone_view : clone_view
	};
});
