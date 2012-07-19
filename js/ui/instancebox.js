define(['js/box','js/ui/propertybox/propertyview','js/ui/displaybox/displayview'],	function(box, pview, dview) {
	var toolbar_template = '<div class="microtoolbox"><span class="icon-comment-alt2"></span><span class="expand_props icon-logout"></span></div>';
	var InstanceBox = box.BoxView.extend({
		events: {
			'click .expand_props' : 'expand_children'
		},
		initialize:function() {
			var this_ = this;
			this.constructor.__super__.initialize.apply(this);
			this.bind('drag', function(offset) { this_._update_pview_offset(offset); });
			this.bind('drag', function(offset) { this_._update_dview_offset(offset); });

			// make a parallel structure for our property view
			this.models_collection = new Backbone.Collection();
			this.options.views_collection.bind('add', function(v) {
				console.log('> adding model ', v.attributes.options.model);
				v = v.attributes;
				this_.models_collection.add(v.options.model);
			});
			this.options.views_collection.bind('remove', function(v) {
				v = v.attributes;
				this_.models_collection.remove(v.options.model);
			});
		},
		render:function() {
			console.log('asking for const');
			this.constructor.__super__.render.apply(this);
			this.$el.append($(toolbar_template));
			return this.el;
		},
		expand_display:function() {
			if (this.dview) {
				this.dview.remove();
				delete this.dview;
				return;
			}
			// make visible
			this.dview = new dview.DisplayBox({src_collection:this.models_collection});
			this.$el.parent().append(this.dview.render());
			this._update_dview_offset({top:this.$el.css("top"), left:parseInt(this.$el.css('left'),10)});
		},
		expand_props:function() {
			if (this.pview) {
				this.pview.remove();
				delete this.pview;
				return;
			}
			// make visible
			this.pview = new pview.PropertyBox({src_collection:this.models_collection});
			this.$el.parent().append(this.pview.render());
			this._update_pview_offset({top:this.$el.css("top"), left:parseInt(this.$el.css('left'), 10)});
		},
		expand_children:function() {
			this.expand_display();
			this.expand_props();
		},
		_update_dview_offset:function(offset) {
			if (this.dview) {
				this.dview.setPosition({top:offset.top+500, left:offset.left});
			}
		},
		_update_pview_offset:function(offset) {
			if (this.pview) {
				this.pview.setPosition({top:offset.top, left:offset.left});
			}
		}
	});
	return { InstanceBox:InstanceBox };
});
