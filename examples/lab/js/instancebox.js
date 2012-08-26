define(
	[
		'examples/lab/js/box',
		'examples/lab/js/propertybox',
		'examples/lab/js/pathables',
		'examples/lab/js/views',
		'examples/lab/js/sparkhist',
		'js/utils'
	],
	function(box, propbox, pathables, view, histogram, utils) {
		var template = '<div class="box-delete icon-cancel"></div><div class="uplt corner"></div><div class="uprt corner"></div><div class="btlt corner"></div><div class="btrt corner"></div><div class="items"></div><input type="text" value="<%= label %>"></input><div class="properties"></div>';
		var toolbar_template = '<div class="microtoolbox"><span class="toggle_paths"></span><span class="toggle_props icon-logout"></span></div><svg class="sparkhist"></svg>';
		var defined = utils.DEFINED;
		var InstanceBox = box.BoxView.extend({
			className:'greybox',
			events: {
				'click .toggle_props' : 'toggle_props',
				'click .box-delete' : '_cb_delete'
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
				this.$el.draggable({
					cancel:".items, .propitems", 
					drag:function(evt,ui) { }, 
				});
				this.views_collection.map(function(v) {	this_._render_view(v);	});
				this.views_collection
					.on('brush', function(model) {
						model = _(model).isArray() ? model : [model];
						this_._find_views(model).map(function(v) { return v.$el.addClass('brush'); });
					})
					.on('unbrush', function(model) {
						model = _(model).isArray() ? model : [model];						
						this_._find_views(model).map(function(v) { return v.$el.removeClass('brush'); });
					});
				// set up to receive droppables
				this.$el.droppable({
					greedy:true, // magical for allowing nesting of droppables
					accept:'.item,.pathable-view,.dereferenced-model',
					tolerance:"touch",
					over:function(event, ui) {
						$(this).addClass("over");
					},
					out:function(event, ui) {
						$(this).removeClass("over");
					},
					drop: function( event, ui ) {
						$(this).removeClass("over");
						var model = ui.draggable.data("model")().clone();
						var v = new view.PathableView({model:model});
						this_.add(v);
						this_._render_view(v);
					}
				});
				// add a toolbar.
				this.$el.append($(toolbar_template));
				this.$el.data('view', this);
				// add a property box

				this.propbox = this._make_property_box();
				// this.pathbox = this._make_path_box();
				this.hist = this._make_micro_hist();
				return this;
			},

			_make_micro_hist:function() {
				var this_ = this;
				var hist = new histogram.HistView({
					el:this.$el.find('.sparkhist')[0],
					views:this.views_collection
				});
				hist.render();
				return hist;
			},
			add:function(itemview) {
				// warning: this method shadows parent
				var pathable = itemview.options.model; 
				var this_ = this;
				// this is a sneaky which consolidates the pathables of views that are
				// added to the same box, so if one gets dereferenced then they all do.
				if (this_.pathables.get(pathable.id)) {
					// warn: we already have a pathable there so eeks
					console.log('already have a pathable for him ', this_.pathables.get(pathable.id));
					itemview.setModel(this_.pathables.get(pathable.id));
				} else {
					this_.pathables.add(pathable);
				}
				var lvc = this.views_collection.length;
				this.views_collection.add(itemview);
				itemview.on('delete', function() {
					itemview.$el.fadeOut('fast', function() { this_.remove(itemview); });
				});
				itemview.on('property-click', function(evt, ui) {
					this_._dereference_by_property($(evt.target).attr('data-prop'));
				});
				console.log("instancebox :: ADD ITEM : before - ", lvc, ' after - ', this.views_collection.length);				
			},
			remove:function(itemview) {
				var m = itemview.options.model;
				var this_ = this;
				if (this.views_collection.filter(function(iv) {	return iv.options.model.id == m.id;	}).length == 1) {
					this_.pathables.remove(m);
   			    }
				var lvc = this.views_collection.length;
				this.views_collection.remove(itemview);
				itemview.$el.remove();
				console.log("instancebox :: REMOVE ITEM : before - ", lvc, ' after - ', this.views_collection.length);
			},
			_dereference_by_property:function(propertyname) {
				// TODO -- check the extension logic to see if it does this:
				//   for each path, try to apply extension
				//     - did the extension affect any pathable? if so, keep it - else abandon extension!
				//     - did the new extended path leave anyone behind? if so, add a clone of the unextended path at _lower priority_ (under) XX 
				//     - make sure you try solo at the end -- [] + [[step]]! 
				var this_ = this;
				var step = new pathables.PropertyDereferenceStep({property:propertyname});
				this_.pathables.paths.map(function(path) {
					var pc = path.clone().add_step(step);
					var result = this_.pathables.try_path(pc);
					console.log(' try path ', pc.get('steps').models.valueOf().join(','), this_.pathables.try_path(pc));
					if (defined(result)) { path.add_step(step); }
				});
				// now try it just solo
				var solo = new pathables.Path([step]);
				if (defined(this_.pathables.try_path(solo))) {
					this_.pathables.add_path(solo);
				}
			},
			_find_views:function(models) {
				return this.views_collection.filter(function(v) { return models.indexOf(v.options.model) >= 0; });
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
				propertybox.bind('property-click', function(propertyname) {  this_._dereference_by_property(propertyname); 	});
				return propertybox;
			},
			toggle_props:function() {
				this.propbox.toggle_visibility();
			},
			_update_propbox:function(top,left) {
				this.propbox.setTopLeft(top,left);
			},
			_cb_delete:function() {
				var this_ = this;
				this.trigger('delete');
				this.$el.fadeOut(function() { this_.$el.remove(); });
			}
		});

		return { InstanceBox:InstanceBox };
	}
);
