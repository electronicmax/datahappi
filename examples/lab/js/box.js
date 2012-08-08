define([], function() {
	var clone_view = function(src_view) {
		// makes a new view from the same model as src_model
		var model = src_view.options.model;
		console.log("clone_view: MODEL ", model.keys().length, model.keys().join(',') );
		if (model.clone) { model = model.clone();	}
		console.log("CLONED MODEL ", model.keys().length, model.keys().join(',') );		
		//model = new model.constructor(_({}).extend(model.attributes));
		//console.log("clone_view: MODEL -after ", model.keys().length, model.toJSON(), model.map(function(v,k) { return k+":"+v.valueOf(); }));
		console.log("new model ", src_view.options.model.attributes, model.attributes);
		var options = _({}).extend(src_view.options, {model:model});
		var view = new src_view.constructor(options);
		view.render();
		return view;
	};

	var ViewCollection = Backbone.Collection.extend({
		initialize:function() {
			
		},
		get_views:function() {
			return Backbone.Collection.prototype.map(function(x) { return x.attributes; });
		},
		get:function(p) {
			var val = Backbone.Collection.prototype.get.apply(this,arguments);
			if (val) { return val.attributes; }
		},
		at:function() {
			var m = Backbone.Collection.prototype.at.apply(this,arguments);
			if (m) { return m.attributes; }
		},
		add:function(v,x) {
			var val = Backbone.Collection.prototype.add.apply(this,arguments);						
			var this_ = this;
			if (!_(v).isArray()) { v = [v]; }
			v.map(function(vv) {
				vv.on('all', function(eventName) { this_.trigger(eventName, vv); }, this_);
			});
			return val;
		},
		remove:function(v) {
			var val = Backbone.Collection.prototype.remove.apply(this,arguments);			
			var this_ = this;
			if (!_(v).isArray()) { v = [v]; }
			v.map(function(vv) {
				vv.off(null, null, this_);
			});
			return val;
		},
		map:function(fn) {
			return this.models.map(function(x) { return fn(x.attributes); });
		},
		filter:function(fn) {
			return this.models.filter(function(x) { return fn(x.attributes); });
		},
		reduce:function(fn, initial) {
			return this.models.filter(function(x) { return fn(x.attributes); }, initial);
		}
	});
	
	var BoxView = Backbone.View.extend({
		tagName:'div',
		defaults: { item_container_class : 'items' },
		initialize:function(options) {
			this.options = _({}).extend(this.defaults, options);
			this.views_collection = new ViewCollection();
		},
		setTopLeft:function(top,left) {
			this.$el.css("top",top).css("left",left);
		},
		render:function() {
			return this;
		},
		_render_view:function(v) {
			// requires there be an 'items' subelement under us.
			this.$el.find("." + this.options.item_container_class).append(v.render().el);
			return this;
		},
		add:function(v) {
			this.views_collection.add(v);
		},
		show:function() {
			if (this.$el.is(":hidden")) { this.$el.show(); }
		},
		hide:function() {
			if (!this.$el.is(":hidden")) { this.$el.hide();  }
		},
		toggle_visibility:function() {
			if (this.$el.is(":hidden")) { this.$el.show(); } else { this.$el.hide(); }
		}
	});
	return {
		BoxView : BoxView,
		clone_view : clone_view
	};
});
