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
		var template = '<div class="titlebar"><input class="title" type="text" value="instances"/><div class="box-delete icon-cancel"></div><svg class="sparkhist"></svg><i class="icon-share clone-box"></i></div><div class="items"></div><div class="properties"></div>';
		var toolbar_template = '<div class="microtoolbox"><span class="toggle_paths"></span><span class="toggle_props icon-logout"></span></div>';
		var defined = utils.DEFINED, dict = utils.TO_OBJ, flatten = utils.flatten, assert = utils.assert;
		var sameas_models_of_pathable = function(p) {
			return [p.model].concat(p.model.sameas);
		};
		var InstanceBox = box.BoxView.extend({
			className:'greybox',
			events: {
				'click .toggle_props' : 'toggle_props',
				'click .box-delete' : '_cb_delete',
				'click .clone-box' : '_cb_clone',
				'click .titlebar' : '_cb_raise'
			},
			initialize:function(options) {
				box.BoxView.prototype.initialize.apply(this,arguments);
				// The collection of pathables which this InstanceBox uses.
				var this_ = this;
				this.pathables = new pathables.Pathables();
				this.pathables.on('add remove change', function() { this_.render(); });
				this.pathables
					.on_model('brush_visual', function(pathable) {
						// console.log("instancebox >> ON PATHABLE brush_visual", pathable.id);						
						pathable = _(pathable).isArray() ? pathable : [pathable];
						this_._find_views_of_model(pathable.map(function(x) { return x.model; })).map(function(v) {
							return v.$el.addClass('brush');
						});
					}, this_)
					.on_model('unbrush_visual', function(pathable) {
						// console.log("instancebox >> ON PATHABLE unbrush_visual", pathable.id);
						pathable = _(pathable).isArray() ? pathable : [pathable];						
						this_._find_views_of_model(pathable.map(function(x) { return x.model; })).map(function(v) {
							return v.$el.removeClass('brush');
						});
					}, this_)
					.on_model('change:sameas', function(p) { this_._change_sameas(p); });				
			},
			clone:function(target_box) {
				var new_instancebox = target_box || new InstanceBox();
				new_instancebox.add( this.views_collection.map(function(x) { return x.clone(); }) );
				new_instancebox.setTitle(this.$el.find('.title').val());
				return new_instancebox;
			},
			setTitle:function(s) {
				this.$el.find('.title').val(s);
			},
			render:function() {
				// this stuff should go into render
				// The PropertyBox belonging to this InstanceBox; initially hidden.
				this.constructor.__super__.render.apply(this);
				var this_ = this;
				if (this.$el.html().length === 0) {
					this.$el.html(_(template).template({label:this.options.label || 'stuff'}));
					// dragging the box
					this.$el
						.draggable({
							cancel:"input, .sparkhist, .items, .propitems, .sparkhist",
							start:function(evt, ui) {
								this_.$el.data('drag_start_position', _($(this).position()).clone());
							},
							drag:function(evt,ui) { }							
						})
						.resizable({});					
					this.$el.find('.items').sortable({	handle:'.reorder-handle', items:'div.pathable-view' });

					// set up to receive droppables
					this.$el.droppable({
						greedy:true, // magical for allowing nesting of droppables
						accept:'.item,.pathable-view,.dereferenced-model,.subcollection,.greybox',
						tolerance:"pointer",
						over:function(event, ui) {
							$(this).addClass("over");
						},
						out:function(event, ui) {
							$(this).removeClass("over");
						},
						drop: function( event, ui ) {
							$(this).removeClass("over");
							this_._handle_dropped_models(
								defined(ui.draggable.data('model')) ?
									[ ui.draggable.data("model")().clone() ] :
									ui.draggable.data('views')().map(function(vv) { return vv.options.model.clone(); }));							
						}
					});
					// add a toolbar.
					this.$el.append($(toolbar_template));
					// for support signalling back for things destined for us when we get dropped on something
					this.$el.data('view', this);
					// this is the avenue by which collections get shared with visuals and with the workspace
					this.$el.data('views', function() { return this_.views_collection; });
					// add a property box
					this.propbox = this._make_property_box();
					this.hist = this._make_micro_hist();
				}
				this.views_collection.map(function(v) {	this_._render_view(v);	});
				return this;
			},
			_handle_dropped_models:function(pathables) {
				// first merge in like models
				var this_ = this;
				var labels_to_models = dict(flatten(this.pathables.map(function(pathable) {
					return pathable.model.get_labels().map(function(label) {
						return [label , pathable.model];
					});
				})));
				pathables = pathables.filter(function(p) {
					var equivalent_model = labels_to_models[p.model.get_label()];
					if (defined(equivalent_model) && equivalent_model.id !== p.model.id) {
						equivalent_model.setSameAs(p.model);
						return false; // don't include because that would dupe
					}
					return true;
				});
				if (pathables.length) { this.add(pathables.map(function(m) { return new view.PathableView({model:m});}));	}
				// debug debug
				pathables.map(function(p) { this_._change_sameas(p); });
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
			// this is cleverwork that makes sure we don't get dupes in a list
			_change_sameas:function(p) {
				// console.log('_change_sameas', this._find_all_views_sameas_models());
				while (this._find_all_views_sameas_models().filter(function(x) { return x == p.model; }).length > 1) {
					// find one and remove it!
					var views_with_pathable = this._get_views_sameas_pathable(p);
					assert(views_with_pathable.length > 0, "error.");
					this.remove(views_with_pathable[views_with_pathable.length - 1]);
				}
			},
			_get_views_sameas_pathable:function(p) {
				var pmodel = p.model;
				return this.views_collection.filter(function(v) {
					return sameas_models_of_pathable(v.options.model).indexOf( pmodel ) >= 0;
				});
			},
			_find_all_views_sameas_models:function() {
				// computes the sameas equivalence graph
				return utils.flatten(this.views_collection.map(function(v) { return v.options.model.model.sameas.concat(v.options.model.model); }));
			},			
			add:function(itemviews) {
				// warning: this method shadows parent
				if (!_(itemviews).isArray()) { itemviews = [itemviews]; }
				var this_ = this;				
				itemviews = itemviews.filter(function(itemview) {
					var pathable = itemview.options.model; 
					// this is a sneaky which consolidates the pathables of views that are
					// added to the same box, so if one gets dereferenced then they all do.
					if (this_.pathables.get(pathable.id)) {
						// warn: we already have a pathable there so eeks
						console.log('already have a pathable for him ', this_.pathables.get(pathable.id));
						itemview.setModel(this_.pathables.get(pathable.id));
						return undefined;
					} else {
						this_.pathables.add(pathable);
					}
					itemview.on('delete', function() {
						itemview.$el.fadeOut('fast', function() { this_.remove(itemview); });
					});
					return itemview.on('property-click', function(evt, ui) {
						this_._dereference_by_property($(evt.target).attr('data-prop'));
					});					
				});
				if (itemviews.length > 0) {
					// let's do this silently and then trigger manually
					this.views_collection.add(itemviews, {silent:true});
					this.views_collection.trigger('add', itemviews);
					this.render();
				}
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
				// console.log("instancebox :: REMOVE ITEM : before - ", lvc, ' after - ', this.views_collection.length);
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
					// console.log(' try path ', pc.get('steps').models.valueOf().join(','), this_.pathables.try_path(pc));
					if (defined(result)) { path.add_step(step); }
				});
				// now try it just solo
				var solo = new pathables.Path([step]);
				if (defined(this_.pathables.try_path(solo))) {
					this_.pathables.add_path(solo);
				}
			},
			_find_views_of_model:function(models) {
				return this.views_collection.filter(function(v) { return models.indexOf(v.options.model.model) >= 0; });
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
			},
			_cb_clone:function() { this.trigger('clone'); },
			_cb_raise:function(){ this.trigger('raise');}
			
		});

		return { InstanceBox:InstanceBox };
	}
);
