define(
	[
		'examples/lab/js/box',
		'examples/lab/js/propertybox',
		'examples/lab/js/pathbox',
		'examples/lab/js/pathables',
		'examples/lab/js/pathableview',
		'js/utils'
	],
	function(box, propbox, pathbox, pathables, pathableview, utils) {
		var template = '<div class="uplt"></div><div class="uprt"></div><div class="btlt"></div><div class="btrt"></div><div class="items"></div><input type="text" value="<%= label %>"></input>';
		var toolbar_template = '<div class="microtoolbox"><span class="toggle_paths"></span><span class="toggle_props icon-logout"></span></div><div class="properties"></div>';
		var defined = utils.DEFINED;
		
		var InstanceBox = box.BoxView.extend({
			className:'greybox',
			events: {
				'click .toggle_props' : 'toggle_props',
				'click .toggle_paths' : 'toggle_paths'
			},
			initialize:function(options) {
				box.BoxView.prototype.initialize.apply(this,arguments);
				// The collection of pathables which this InstanceBox uses.
				this.pathables = new pathables.Pathables();
			},
			render:function() {
				// this stuff should go into render
				// The PropertyBox belonging to this InstanceBox; initially hidden.
				this.constructor.__super__.render.apply(this);				
				var this_ = this;
				this.$el.html(_(template).template({label:this.options.label || 'stuff'}));
				// dragging the box
				this.$el.draggable({ drag:function(evt,ui) { this_.trigger('drag', ui.offset); }});
				this.get_item_views().map(function(v) {	this_._render_view(v);	});
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
						$(this).removeClass("over");
						var v = box.clone_view(ui.draggable.data("view"));
						this_.add(v);
						this_._render_view(v);
					}
				});				
				// add a toolbar.
				this.$el.append($(toolbar_template));
				// add a property box
				this._make_property_box();
				return this;
			},
			add:function(itemview) {
				// warning: this method shadows parent 
				var m = itemview.options.model;
				var this_ = this;
				if (this_.pathables.get(m.id)) {
					// warn: we already have a pathable there so eeks
					itemview.options.model = this_.pathables.get(m.id);
				} else {
					this_.pathables.add(m);
				}
				var lvc = this.views_collection.length;
				this.views_collection.add(itemview);
				console.log("instancebox :: ADD ITEM : before - ", lvc, ' after - ', this.views_collection.length);				
			},
			remove:function(itemview) {
				var m = itemview.options.model;
				var this_ = this;
				if (this.get_item_views().filter(function(iv) {	return iv.options.model.id == m.id;	}).length == 1) {
					this_.pathables.remove(m);
   			    }
				var lvc = this.views_collection.length;
				this.views_collection.remove(itemview);
				itemview.$el.remove();
				console.log("instancebox :: REMOVE ITEM : before - ", lvc, ' after - ', this.views_collection.length);
			},
			_make_property_box:function() {
				// add a property box.
				var this_ = this;
				var propertybox = new propbox.PropertyBox({
					el: this.$el.find('.properties'),
					hidden:true,
					pathables:this.pathables
				});
				propertybox.render();
				propertybox.bind('property-click', function(propertyname) {
					// get paths from the pathables
					console.log("PROPERTY CLICK ", propertyname);
					var step = new pathables.PropertyDereferenceStep({property:propertyname});
					this_.pathables.paths.map(function(path) {
						var pc = path.clone().add_step(step);
						var result = this_.pathables.try_path(pc);
						if (defined(result)) { path.add_step(step); }
					});
					var solo = new pathables.Path([step]);
					if (defined(this_.pathables.try_path(solo))) { this_.pathables.add_path(solo);	}
					console.log(' -> paths -> ', this_.pathables.paths.map(function(path) { return path.get('steps').map(function(x) { return x.id; }).join(','); }));
					propertybox.hide();
				});
				this.propbox = propertybox;
				return propertybox;
			},
			_make_path_box:function() {
				// add a path box.
				var pathbox_ = new pathbox.PathBox({
					el: this.$el.find('.paths'),
					hidden:true,
					pathables:this.pathables
				});
				pathbox_.render();
				this.pathbox = pathbox_;
				return pathbox;
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

		/*
		var InstanceBoxShadow = InstanceBox.extend({
			className:'shadowbox',
			initialize:function() {
				InstanceBox.prototype.initalize.apply(this,arguments);
				this.master = this.options.master_box;
			}			
		});
		*/
		
		return { InstanceBox:InstanceBox };
	}
);
