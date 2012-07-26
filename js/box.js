define([], function() {

	var template = '<div class="uplt"></div><div class="uprt"></div><div class="btlt"></div><div class="btrt"></div><div class="items"></div><input type="text" value="<%= label %>"></input>';
	
	var clone_view = function(src_view) {
		// makes a new view from the same model as src_model
		var view = new src_view.constructor(src_view.options);
		window.srcview = src_view;
		view.render();
		return view;
	};	
	var BoxView = Backbone.View.extend({
		template:template,
		tagName:'div',
		className:'greybox',
		initialize:function() {
			this.options.views_collection = this.options.views_collection ? this.options.views_collection : new Backbone.Collection();
			
			this.render();
		},
		render:function() {
			var this_ = this;
			this.$el.html(_(this.template).template({label:this.options.label || 'stuff'}));
			this.$el.draggable({
				drag:function(evt,ui) {
					this_.trigger('drag', ui.offset);
				}
			});
			this.options.views_collection.map(function(v) { this_._add_view(v); });
			this.$el.droppable({
				greedy:true, // magical for allowing nesting of droppables
				accept:'.item, .simple',
				tolerance:"touch",
				over:function(event, ui) {
					$(this).addClass("over");
				},
				out:function(event, ui) {
					$(this).removeClass("over");
				},				
				drop: function( event, ui ) {
					// console.log("boxdropped ", event, ui, event.target == this_.el);
					$(this).removeClass("over");
					var view = clone_view(ui.draggable.data("view"));
					this_.add(view);
				}
			});
			return this.el;
		},
		_add_view:function(v) {
			this.$el.find('.items').append(v.render().el);
		},
		add:function(v) {
			console.log('adding view ', v);
			this.options.views_collection.add(v);
			this._add_view(v);
		}
	});
	return {
		BoxView : BoxView,
		clone_view : clone_view
	};
});
