define([
	'examples/lab/js/pathables',
	'examples/lab/js/sidebar',		
	'examples/lab/js/box',
	'examples/lab/js/instancebox',
	'examples/lab/js/views',
	'examples/lab/js/toolbar',
	'examples/lab/js/visual',
	'js/utils',
	'js/googlecal/CalendarCollection',
	'js/googlecal/auth'
], function(pathables, sidebar, box, ibox, views, toolbar, visual, util, cc, auth) {
		var Main = Backbone.View.extend({
			events: {
				'click .workspace ':'_workspace_clicked'
			},
			
			initialize:function() {	},
			render:function() {
				var this_ = this, workspace = this.$el.find('.workspace');
				this.sidebar =
					(new sidebar.SidebarView({	sources: this.options.data_sources,	el : this.$el.find('.slidepanel')[0]}))
					.on('new_group', function() { this_._new_group(); })
					.render()
					.slideOut();
				
				var tb = (new toolbar.Toolbar())
					.on('new_visual', function() {
						workspace.append((new visual.Visual()).render().el);
					});
				
				workspace
					.append(tb.render().el)
					.droppable({
						accept:'.item, .dereferenced-model',
						tolerance:"touch",
						over:function(event, ui) {},
						out:function(event, ui) {},				
						drop: function( event, ui ) {
							var target_box = new ibox.InstanceBox();
							var model = ui.draggable.data("model")().clone();
							target_box.add(new views.PathableView({model:model}));
							target_box.setTopLeft(ui.helper.position().top, ui.helper.position().left - this_.sidebar.$el.width());
							this_.$el.find(".workspace").append(target_box.render().el);
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
				pathables.get_from_source("http://"+document.location.host+ [basepath,'tests','peeps.rdf'].join('/'))
				//	pathables.get_from_source("http://"+document.location.host+ [basepath,'tests','rooms-and-buildings.rdf'].join('/'))
			).then(function() {
					var srcs = _.toArray(arguments);
					console.log("SOURCES >>> ", srcs, srcs.length);
				    window.__srcs__ = srcs; // DEBUG
					var wview = new Main({el : $('body'), data_sources: srcs});
					wview.render();
					console.log("el > ", wview.el, wview.$el.find('.workspace'));
					wview.sidebar.slideOut('very fast');
				});
		})();		
	});

