/* this is for the box example only  */
define(
	[
		'examples/lab/js/sources',
		'examples/lab/js/sidebar',		
		'examples/lab/js/pathables',
		'examples/lab/js/box',
		'examples/lab/js/instancebox',
		'examples/lab/js/views',
		'js/utils',
		'js/googlecal/CalendarCollection',
		'js/googlecal/auth'
	],
	function(sources, sidebar, pathables, box, ibox, views, util, cc, auth) {
		
		var WorkspaceView = Backbone.View.extend({
			events: {
				'click ':'_workspace_clicked'
			},
			initialize:function() {
				
			},
			render:function() {
				var this_ = this;
				this.sidebar = new sidebar.SidebarView({
					sources: this.options.data_sources,
					el : this.$el.find('.slidepanel')[0]
				});
				this.sidebar.bind('new_group', function() { this_._new_group(); });
				this.sidebar.render();
				this.sidebar.slideOut();
				this.$el.droppable({
					accept:'.item',
					tolerance:"touch",
					over:function(event, ui) {
						console.log("OVER workspace ");
						if (event.target !== this_.el) { return ; }
						console.log("workspace over ", event, ui);
					},
					out:function(event, ui) {},				
					drop: function( event, ui ) {
						console.log("EVENT ", event, " UI " , ui);
						if (event.target !== this_.el) { return ; }
						var target_box = this_._new_group();
						console.log('view to drag ', ui.draggable.data("view"));
						target_box.add(box.clone_view(ui.draggable.data("view")));
						target_box.setTopLeft(event.pageY - target_box.$el.height(), event.pageX - 300);
						event.stopPropagation();
						return false;
					}
			});				
				return this;
			},
			_new_group:function() {
				var box = new ibox.InstanceBox();
				// TODO do something about this --- move out to parent widget
				$('.workspace').append(box.render().el);
				return box;
			},
			_workspace_clicked:function() {
				var this_ = this;
				$(".workspace").click(function(){ this_.sidebar.slideAway();  });
			}
		});
		
		// // ---		
		(function() {
			// prepopulate all the things!
			var basepath = window.__basepath__;
			util.assert(basepath, "__basepath__ not set");

			$(".definitions_url").val("http://"+document.location.host+[basepath,'tests','rooms-and-buildings.rdf'].join('/'));
			$(".url").val("http://"+document.location.host+ [basepath,'tests','events-diary.rdf'].join('/'));
			var wview = new WorkspaceView({
				data_sources: [
					//new sources.Source({ name: "Buildings", url: "http://"+document.location.host+[basepath,'tests','rooms-and-buildings.rdf'].join('/') }),
					new sources.Source({ name: "Events", url: "http://"+document.location.host+ [basepath,'tests','events-diary.rdf'].join('/') })
				],				
				el : $('#box_example')[0]
			});
			wview.render();
			wview.sidebar.slideOut();
		})();
	});

