define(
	[
		'examples/lab/js/box',
		'examples/lab/js/propertybox',
		'examples/lab/js/pathables',
		'examples/lab/js/pathableview'
	],
	function(box, pbox, pathables, pathableview) {
		var toolbar_template = '<div class="microtoolbox"><span class="icon-comment-alt2"></span><span class="toggle_props icon-logout"></span></div>';
		var InstanceBox = box.BoxView.extend({
			events: {
				'click .toggle_props' : 'toggle_props'
			},
			initialize:function(options) {
				this.constructor.__super__.initialize.apply(this, [options]);
				
				var this_ = this;
				// The collection of pathables which this InstanceBox uses.
				this.pathables = new pathables.Pathables();

				// this stuff should go into render
				// The PropertyBox belonging to this InstanceBox; initially hidden.
				this.propbox = new pbox.PropertyBox({
					hidden:true,
					pathables:this.pathables
				});
				$('.workspace').append(this.propbox.render().el);

				// TODO: Ask max how this is different to having a 'drag' function.
				this.bind('drag', function(offset) { console.log('update propbox position '); this_._update_propbox(offset.top, offset.left); });

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
				return this;
			},
			toggle_props:function() {
				if (this.propbox.hidden) {
					this.propbox.show();
					this._update_propbox(parseInt(this.$el.css("top"),10), parseInt(this.$el.css('left'), 10));
				} else {
					this.propbox.hide();
				}
			},
			_update_propbox:function(top,left) {
				this.propbox.setTopLeft(top,left);
			}
		});
		return { InstanceBox:InstanceBox };
	}
);
