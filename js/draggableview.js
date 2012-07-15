define([],
	   function() {
		   var DraggableView = Backbone.View.extend({
			   initialize:function() {},
			   render:function() {
				   console.log('this.$el',this.$el);
				   this.$el.draggable({revert:"invalid", helper:"clone"});
				   this.$el.data("view", this);
				   this.$el.data("model", this.options.model);
				   return this.el;
			   }
		   });
		   var Simple = DraggableView.extend(
			   {
				   className:'simple',
				   render:function() {
					   this.$el.html('hello');
					   this.constructor.__super__.render.apply(this);
					   return this.el;
				   }
			   }
		   );		   
		   return {
			   DraggableView:DraggableView,
			   Simple:Simple
		   };		   
	   });
