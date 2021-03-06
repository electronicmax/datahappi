define(['examples/lab/js/views','examples/lab/js/view-collection','examples/lab/js/box','js/utils'],function(views,view_collection,box,utils) {
	var flatten = utils.flatten, defined = utils.DEFINED, deferred = utils.deferred, when = utils.when, hash = utils.hash;
	var InventoryView = Backbone.View.extend({
		className:'inventory',
		tagName:'div',
		events: {
			
		},
		template:'',
		category_template:"<div class='subcollection'><div class='lbl accordion-heading'><a class='accordion-toggle' data-toggle='collapse'><%= label %></a></div><div class='accordion-body items collapse'></div></div>",
		thinglens: views.ThingListItemView,
		initialize:function() {
			var this_ = this;
			this.collection = this.options.collection || new Backbone.Collection();
			this.enabled_sources = new Backbone.Collection();
			this.collection.on('add', function() { this_.render(); }, this);
		},
		_get_visible_dudes:function() {
			//	var src_ids = this.
			return this.collection; // .filter(function(pathable) { return pathable.model.get("source")[0].id == src.id;});
		},
		render:function() {
			var this_ = this;
			var id_of_pathable = function(pathable) { return pathable.model.id; };
			var ids_of_elements = function($sel) {
				return $.makeArray($sel.map(function() {
					return id_of_pathable( $(this).data('view').options.model ) ;
				}));
			};
			var get_subcollection_for_type = function(typeid) {
				return this_.$el.find('div.subcollection[class-uri="'+typeid+'"]');
			};			
			var elements_with_ids = function($el, ids) {
				return $.makeArray($el.filter(function() {
					return ids.indexOf(id_of_pathable( $(this).data('view').options.model )) >= 0;
				}));
			};
			
			var visible_dudes = this._get_visible_dudes();
			var dude_types = _.uniq(flatten(visible_dudes.map(function(x) {
				return x.model.get('type') || [];
			}))).concat(['__misc__']);

			var make_view_getter = function(subcollection_$el) {
				return function() {
					var views = $.makeArray(
						subcollection_$el.find('.items').children().map(function(x) { return $(this).data('view'); })
					);
					var vc = new view_collection.ViewCollection();
					vc.add(views);
					return vc;
				};										
			};

			// subcollection enter selection
			dude_types.map(function(type) {
				if (type == '__misc__') {
					if (get_subcollection_for_type('__misc__').length == 0) {
						var subc_view = $(_(this_.category_template).template({label:'other'}))
							.attr('class-uri', '__misc__')
							.find('.items').attr('id','subcollection-items-__misc__').end()					
							.find('.lbl a')
								.attr('data-parent', '#inventory-things')
								.attr('href','#subcollection-items-__misc__')
								.end()
							.appendTo(this_.$el);
						subc_view.data('views', make_view_getter(subc_view));
						subc_view.draggable({
							revert:"invalid",
							helper:"clone",
							appendTo:'body'
						});						
					}
					return;
				}
				if (get_subcollection_for_type(type.id).length == 0) {
					var subc_view = $(_(this_.category_template).template({label:type.get_label()}))
						.attr('class-uri', type.id)
						.find('.items').attr('id',"subcollection-items-"+hash(type.id)).end()					
						.find('.lbl a')
							.attr('data-parent', '#inventory-things')					
							.attr('href','#subcollection-items-'+hash(type.id))
							.end()
						.appendTo(this_.$el);
					subc_view.data('views', make_view_getter(subc_view));
					subc_view.draggable({
						revert:"invalid",
						helper:"clone",
						appendTo:'body'
					});					
				}
			});
			
			// subcollection exit selection
			var exit_sel_ids = _(this_.$el.find('div.subcollection').map(function(x) {
				return $(this).attr('class-uri');
			})).difference(dude_types.map(function(x) { return x.id; }).concat('__misc__'));
			
			this.$el.find('div.subcollection')
				.filter(function() { return exit_sel_ids.indexOf($(this).attr('class-uri')) >= 0; })
				.remove();			

			// subcollection populate
			this_.$el.find('div.subcollection').map(function() {
				var this_subcollection = $(this);
				var subcollection_id = $(this).attr('class-uri');
				var relevant_things = visible_dudes.filter(function(x) {
					if (subcollection_id == '__misc__') {
						return x.model.get('type') == undefined || x.model.get('type').length === 0; 
					}
					return (x.model.get('type') || []).map(function(x) { return x.id; }).indexOf(subcollection_id) >= 0;
				});
				var relevant_ids = relevant_things.map(id_of_pathable);
				
				// TODO TODO TODO -------------------------------------------------------------------
				// enter selection
				// console.log("IDS OF ELEMENTS ", relevant_ids, 'vs', ids_of_elements($(this).find('.item')));
 				var enter_ids = _(relevant_ids).difference(ids_of_elements($(this).find('.item')));
				// console.log("ENTER IDs ", enter_ids);

				// create for visible dudes
				visible_dudes.filter(function(pathable) {
					return enter_ids.indexOf(id_of_pathable(pathable)) >= 0;
				}).map(function(pathable) {
					var lens = new this_.thinglens({model:pathable}).render();
					this_subcollection.find('.items').append(lens.el);
					lens.$el
						.attr('uri', id_of_pathable(pathable))
						.attr('data-parent', 'subcollection-'+this_subcollection.attr('id'));					
				});
				
				// exit selection
				var exit_ids = _(ids_of_elements($(this).find('.item'))).difference(relevant_ids);
				// console.log(' exit ids ', exit_ids, ' - ', elements_with_ids(exit_ids));
				$(elements_with_ids(exit_ids)).remove();
				// update selection? no need -
			});
			return this;
		},
		setSourceEnabled:function(src) {
			if (this.enabled_sources.indexOf(src) < 0) {
				this.enabled_sources.push(src);
			}
			return this.render();
		},
		setSourceDisabled:function(src) {
			if (this.enabled_sources.indexOf(src) >= 0) {
				this.enabled_sources = _(this.enabled_sources).without(src);
			}
			return this.render()
		}		
	});

	return { InventoryView: InventoryView };
	
});
