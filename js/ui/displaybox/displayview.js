define(
	[
		'js/ui/displaybox/displaycollection',
		'js/draggableview'
	],
	function(dc, dv) {
		var DisplayView = Backbone.View.extend({
			tagName:"div",
			className:"display-view",
			template:"<%= _id %><div class='property-container'></div>",
			render:function() {
				this.$el.html(_(this.template).template(this.options.model.toJSON()));
				this.$el.data("view", this);
				this.$el.data("model", this.options.model);
				return this.el;
			},
		});

		var DisplayBox = Backbone.View.extend({
			tagName:"div",
			className:"display-box",
			template:"", // TODO.
			render:function() {
				var this_ = this;
				this.$el.html(_(this.template).template());
				['test1', 'test2', 'test3'].map(function(v) {this_.$el.append(v)});
				return this.el;
			},
			setPosition:function(x) {
				this.$el.css("top", x.top);
				this.$el.css("left", x.left);
  		    }
		});

		return {
			DisplayBox:DisplayBox
		};
	}
);

