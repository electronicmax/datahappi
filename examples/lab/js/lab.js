define([
	'js/models',
	'examples/lab/js/pathables',
	'examples/lab/js/sidebar',		
	'examples/lab/js/box',
	'examples/lab/js/instancebox',
	'examples/lab/js/views',
	'examples/lab/js/toolbar',
	'examples/lab/js/visual',
	'examples/lab/js/visual-map',	
	'js/utils',
	'js/googlecal/CalendarCollection',
	'js/googlecal/auth'
], function(models,pathables, sidebar, box, ibox, views, toolbar, visual, visualmap, util, cc, auth) {

	var defined = util.DEFINED;
	
		var Main = Backbone.View.extend({
			events: {
				'click .workspace ':'_workspace_clicked'
			},
			
			initialize:function() {	},
			render:function() {
				var this_ = this, workspace = this.$el.find('.workspace');
				this.sidebar =
					(new sidebar.SidebarView({
						sources: this.options.data_sources,
						el : this.$el.find('.slidepanel')[0]
					}))
					.on('new_group', function() { this_._new_group(); })
					.render()
					.slideOut();
				
				var tb = (new toolbar.Toolbar())
					.on('new_visual', function() {
						var v = (new visual.Visual());
						workspace.append(v.render().el);
						v._update_plot();
					})
					.on('new_map',function() {
						var map = (new visualmap.MapVisual());
						workspace.append(map.render().el);
						map.update();
					});
				
				workspace
					.append(tb.render().el)
					.droppable({
						accept:'.item,.pathable-view,.dereferenced-model,.subcollection',
						tolerance:"touch",
						over:function(event, ui) {},
						out:function(event, ui) {},				
						drop: function( event, ui ) {
							var target_box = new ibox.InstanceBox();
							target_box.setTopLeft(ui.helper.position().top, ui.helper.position().left - this_.sidebar.$el.width());							
							this_.$el.find(".workspace").append(target_box.render().el);
							if (defined(ui.draggable.data('model'))) {
								var model = ui.draggable.data("model")().clone();
								target_box.add(new views.PathableView({model:model}));
							} else if (defined(ui.draggable.data('views'))) {
								target_box.add(ui.draggable.data('views')().map(function(view) {
									return new views.PathableView({model:view.options.model})
								}));
							}
							return false;
						}
					});
				return this;
			},
			_workspace_clicked:function() {
				var this_ = this;
				this.$el.find(".workspace").click(function(){ this_.sidebar.slideAway();  });
			}
		});
		
		// // ---		
		(function() {
			// prepopulate all the things!
			var basepath = window.__basepath__;
			util.assert(basepath, "__basepath__ not set");
			$(".definitions_url").val("http://"+document.location.host+[basepath,'tests','rooms-and-buildings.rdf'].join('/'));
			$(".url").val("http://"+document.location.host+ [basepath,'tests','events-diary.rdf'].join('/'));
			$.when(
				// add moar sources here
				pathables.get_from_source("http://"+document.location.host+ [basepath,'tests','peeps.rdf'].join('/')),
				pathables.get_from_source("http://"+document.location.host+ [basepath,'tests','rawdata','restaurants-tripadvisor.rdf'].join('/'), "Tripadvisor Restaurants"),
				pathables.get_from_source("http://"+document.location.host+ [basepath,'tests','rawdata','businesses-yelp.rdf'].join('/'), "Yelp Business Listing"),
				pathables.get_from_source("http://"+document.location.host+ [basepath,'tests','rawdata','menus.rdf'].join('/'), "Menus")
			).then(
				function() {
					var srcs = _.toArray(arguments);
					window.__srcs__ = srcs;
					var wview = new Main({el : $('body'), data_sources: srcs}).render();
					wview.sidebar.slideOut('very fast');
				});
		})();		
	});

