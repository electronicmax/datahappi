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
	'js/googlecal/auth',
	'tests/rawdata/datasets'
], function(models,pathables, sidebar, box, ibox, views, toolbar, visual, visualmap, util, cc, auth, datasets) {

	var AUTO_HIDE_SIDEBAR = false;
	var defined = util.DEFINED;
	var when = util.when;
	
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
							var target_box = this_._make_new_instance_box();
							target_box.setTopLeft(ui.helper.position().top, ui.helper.position().left - this_.sidebar.$el.width());							
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
			_make_new_instance_box:function() {
				var this_ = this;
				var box = new ibox.InstanceBox();
				box.on('clone',function() {
					var boxclone = this_._make_new_instance_box();
					box.clone(boxclone);
					this_.$el.find(".workspace").append(boxclone.render().el);
					boxclone.setTopLeft(box.$el.position().top, box.$el.position().left + box.$el.width() + 20);
				});
				this.$el.find(".workspace").append(box.render().el);				
				return box;
			},
			_workspace_clicked:function() {
				var this_ = this;
				if (AUTO_HIDE_SIDEBAR) {
					this.$el.find(".workspace").click(function(){ this_.sidebar.slideAway();  });
				}
			}
		});
		
		// // ---		
		(function() {
			// prepopulate all the things!

            // TODO set the elsewhere
            var dataset_name = util.getParameterByName('dataset') || 'test'; // "cambridge" or "glasgow"
			var basepath = window.__basepath__;
			console.log('loading dataset ', dataset_name, ' ', datasets[dataset_name].length);
			var dataset = datasets[dataset_name];
			util.assert(basepath, "__basepath__ not set");
			$(".definitions_url").val("http://"+document.location.host+[basepath,'tests','rooms-and-buildings.rdf'].join('/'));
			$(".url").val("http://"+document.location.host+ [basepath,'tests','events-diary.rdf'].join('/'));
			when(dataset.map(function(x) {
				return pathables.get_from_source('http://'+basepath+'/'+x.path, x.name);
			})).then(function() {
				var srcs = _.toArray(arguments);
				window.__srcs__ = srcs;
				var wview = new Main({el : $('body'), data_sources: srcs}).render();
				wview.sidebar.slideOut('very fast');
			});
		})();		
	});

