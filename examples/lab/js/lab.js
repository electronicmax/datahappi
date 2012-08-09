define([
		'examples/lab/js/pathables',
		'examples/lab/js/sidebar',		
		'examples/lab/js/box',
		'examples/lab/js/instancebox',
		'examples/lab/js/views',
		'js/utils',
		'js/googlecal/CalendarCollection',
		'js/googlecal/auth'
	],
	function(pathables, sidebar, box, ibox, views, util, cc, auth) {
		var Main = Backbone.View.extend({
			events: {
				'click .workspace ':'_workspace_clicked'
			},
			initialize:function() {	},
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
						var target_box = new ibox.InstanceBox();
						window.target_box = target_box;
						target_box.add(box.clone_view(ui.draggable.data("view")));
						target_box.setTopLeft(ui.helper.position().top, ui.helper.position().left - this_.sidebar.$el.width());
						this_.$el.find(".workspace").append(target_box.render().el);

						// TODO: Remove.
						window.box = target_box;
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
//				pathables.get_from_source("http://"+document.location.host+ [basepath,'tests','rooms-and-buildings.rdf'].join('/'))
			).then(function() {
					var srcs = _.toArray(arguments);
					console.log("WHEN >>> ", srcs, srcs.length);
					var wview = new Main({el : $('body'), data_sources: srcs});
					wview.render();
					console.log("el > ", wview.el, wview.$el.find('.workspace'));
					wview.sidebar.slideOut();
				});
		})();		
	});

