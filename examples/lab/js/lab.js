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
		var Main = Backbone.View.extend({
			events: {
				'click .workspace ':'_workspace_clicked'
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
				this.$el.find('.workspace').droppable({
					accept:'.item',
					tolerance:"touch",
					over:function(event, ui) {},
					out:function(event, ui) {},				
					drop: function( event, ui ) {
						// if (event.target !== this_.el) { return ; }
						var target_box = this_._new_group();
						target_box.add(box.clone_view(ui.draggable.data("view")));
						target_box.setTopLeft(ui.helper.position().top, ui.helper.position().left - this_.sidebar.$el.width());
						event.stopPropagation();
						return false;
					}
				});				
				return this;
			},
			_new_group:function() {
				var box = new ibox.InstanceBox({dragouttable:true});
				this.$el.find(".workspace").append(box.render().el);
				return box;
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
			var wview = new Main({
				el : $('body'),				
				data_sources: [
					// new sources.Source({ name: "Buildings", url: "http://"+document.location.host+[basepath,'tests','rooms-and-buildings.rdf'].join('/') }),
					// new sources.Source({ name: "Events", url: "http://"+document.location.host+ [basepath,'tests','events-diary.rdf'].join('/') }),
					sources.get_source("http://"+document.location.host+ [basepath,'tests','peeps.rdf'].join('/'), "Sample peeps" )
				]
			});
			wview.render();
			console.log("el > ", wview.el, wview.$el.find('.workspace'));
			
			wview.sidebar.slideOut();
		})();
	});

