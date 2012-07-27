define(
	[
		'js/box',
		'js/ui/propertybox/propertybox',
		'js/pathables',
	],
	function(box, pbox, pathables) {
		var toolbar_template = '<div class="microtoolbox"><span class="icon-comment-alt2"></span><span class="toggle_props icon-logout"></span></div>';
		var InstanceBox = box.BoxView.extend({
			events: {
				'click .toggle_props' : 'toggle_props'
			},
			initialize:function(options) {
				var this_ = this;
				this.constructor.__super__.initialize.apply(this, [options]);

				// The collection of pathables which this InstanceBox uses.
				this.pathables = new pathables.Pathables();

				// TODO: Remove.
				window.pathables = this.pathables;

				// The PropertyBox belonging to this InstanceBox; initially hidden.
				this.propbox = new pbox.PropertyBox({
					hidden:true,
					pathables:this.pathables
				});
				$('.workspace').append(this.propbox.render());

				// TODO: Ask max how this is different to having a 'drag' function.
				this.bind('drag', function(offset) { this_._update_propbox(offset); });

				this.options.views_collection.on('add', function(view) {
					this_.pathables.add(view.get('model'));
				}).on('remove', function(view) {
					this_.pathables.remove(view.get('model'));
				});
				/*
				this.options.views_collection.bind('add', function(v) {
					console.log('> adding model ', v.attributes.options.model);
					this_.models_collection.add(v.attributes.options.model);
				});
				this.options.views_collection.bind('remove', function(v) {
					console.log('> removing model ', v.attributes.options.model);
					this_.models_collection.remove(v.attributes.options.model);
				});
				*/
			},
			render:function() {
				console.log('asking for const');
				this.constructor.__super__.render.apply(this);
				this.$el.append($(toolbar_template));
				return this.el;
			},
			toggle_props:function() {
				if (this.propbox.hidden) {
					this.propbox.show();
					this._update_propbox({top:this.$el.css("top"), left:parseInt(this.$el.css('left'), 10)});
				} else {
					this.propbox.hide();
				}
			},
			_update_propbox:function(offset) {
				this.propbox.setPosition({top:offset.top, left:offset.left});
			}
		});
		return { InstanceBox:InstanceBox };
	}
);
