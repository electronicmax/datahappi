define(['js/box.js'],function(box) {
	var toolbar_template = '<div class="microtoolbox"><span class="expand_props icon-comment-alt2"></span><span class="expand_props icon-logout"></span></div>';
	var PropertyExpandoBox = box.BoxView.extend({
		events: {
			'click .expand_props' : 'expand_props'
		},
		initialize:function() {
		},
		render:function() {
			console.log('asking for const');
			this.constructor.__super__.render();
			this.$el.append($(toolbar_template));
			return this.el;
		},
		expand_props:function(){
			console.log('expand props');
		}		
	});
	return { PropExpandableBoxView:PropertyExpandoBox};
});
