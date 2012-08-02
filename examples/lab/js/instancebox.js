define(
	[
		'examples/lab/js/box',
		'examples/lab/js/propertybox',
		'examples/lab/js/pathbox',
		'examples/lab/js/pathables',
		'examples/lab/js/pathableview'
	],
	function(box, propbox, pathbox, pathables, pathableview) {
		var template = '<div class="uplt"></div><div class="uprt"></div><div class="btlt"></div><div class="btrt"></div><div class="items"></div><input type="text" value="<%= label %>"></input>';
		var toolbar_template = '<div class="microtoolbox"><span class="toggle_paths"></span><span class="toggle_props icon-logout"></span></div><div class="properties"></div>';
		var InstanceBox = box.BoxView.extend({
			className:'greybox',
			events: {
				'click .toggle_props' : 'toggle_props',
				'click .toggle_paths' : 'toggle_paths',
			},
			initialize:function(options) {
				this.constructor.__super__.initialize.apply(this, [options]);
				var this_ = this;
				// The collection of pathables which this InstanceBox uses.
				this.pathables = new pathables.Pathables();

				// TODO: Ask max how this is different to having a 'drag' function.
				// this.bind('drag', function(offset) { console.log('update propbox position '); this_._update_propbox(offset.top, offset.left); });

				this.views_collection.on('add', function(view) {
					this_.pathables.add(view.get('model'));
				}).on('remove', function(view) {
					this_.pathables.remove(view.get('model'));
				});
				/*
				this.views_collection.bind('add', function(v) {
					console.log('> adding model ', v.attributes.options.model);
					this_.models_collection.add(v.attributes.options.model);
				});
				this.views_collection.bind('remove', function(v) {
					console.log('> removing model ', v.attributes.options.model);
					this_.models_collection.remove(v.attributes.options.model);
				});
				*/
			},
			render:function() {
				// this stuff should go into render
				// The PropertyBox belonging to this InstanceBox; initially hidden.
				this.constructor.__super__.render.apply(this);				
				var this_ = this;
				this.$el.html(_(template).template({label:this.options.label || 'stuff'}));
				this.$el.draggable({ drag:function(evt,ui) { this_.trigger('drag', ui.offset); }		});
				this.views_collection.map(function(v) { this_._add_view(v); });

				// set up to receive droppables
				this.$el.droppable({
					greedy:true, // magical for allowing nesting of droppables
					accept:'.item',
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
						var view = box.clone_view(ui.draggable.data("view"));
						this_.add(view);
					}
				});

				// add a toolbar.
				this.$el.append($(toolbar_template));

				// add a property box.
				var propertybox = new propbox.PropertyBox({
					el: this.$el.find('.properties'),
					hidden:true,
					pathables:this.pathables
				});
				propertybox.render();
				propertybox.bind('property-click', function(propertyname) {
					console.log('property-click! ', propertyname);
					this_.pathables.try_extend_path(new pathables.PropertyDereferenceStep({ property : propertyname }));
				});
				this.propbox = propertybox;

				// add a path box.
				var pathbox_ = new pathbox.PathBox({
					el: this.$el.find('.paths'),
					hidden:true,
					pathables:this.pathables
				});
				pathbox_.render();
				this.pathbox = pathbox_;

				return this;
			},
			toggle_paths:function() {
				this.pathbox.toggle_visibility();
			},
			toggle_props:function() {
				this.propbox.toggle_visibility();
			},
			_update_propbox:function(top,left) {
				this.propbox.setTopLeft(top,left);
			}
		});
		return { InstanceBox:InstanceBox };
	}
);
