/* this is for the box example only  */
define(
	[
<<<<<<< HEAD
	'js/ui/instancebox',
	'js/draggableview',
	'js/ui/tableview',
	'js/models',
	'js/utils',
	'js/googlecal/CalendarCollection',
	'js/googlecal/auth',
	'js/ops/chain-engine'
	],
	function(box, dv, tv, model, util, cc, auth, ce) {
		var path = document.location.pathname;
		var basepath = path.slice(0,path.lastIndexOf('/')); // chop off 2 /'s
		basepath = basepath.slice(0,Math.max(0,basepath.lastIndexOf('/'))) || '/';


		var new_group = function() {
		var bv = new box.InstanceBox();
		$('#mainpanel').append(bv.render());
		};


		$("#definitions_url").val("http://"+document.location.host+[basepath,'tests','rooms-and-buildings.rdf'].join('/'));
		$("#url").val("http://"+document.location.host+ [basepath,'tests','events-diary.rdf'].join('/'));
		$('#new_group').click(new_group);

		// $('body').prepend((new dv.Simple()).render());
		var things_view = new tv.TableView({
			el:$('table')[0],
			columns:[
				function(m) {
					var view = new tv.GenericItemView({model:m});
					view.render();
					view.$el.addClass('item').draggable({revert:"invalid", helper:"clone", appendTo:'body'});
					view.$el.data('view',view);
					view.$el.data('model',view.options.model);
					return view.el;
				}
			]
		});

=======
		'js/box',
		'js/ui/instancebox',
		'js/draggableview',
		'js/ui/tableview',
		'js/models',
		'js/utils',
		'js/googlecal/CalendarCollection',
		'js/googlecal/auth'
	],
	function(box, ibox, dv, tv, model, util, cc, auth) {
		var path = document.location.pathname;
		var basepath = path.slice(0,path.lastIndexOf('/')); // chop off 2 /'s
		basepath = basepath.slice(0,Math.max(0,basepath.lastIndexOf('/'))) || '/';
		
>>>>>>> 6bff4d4926ca7b2c028d399869b6a1c342d0dca8
		var Source = Backbone.Model.extend({
			defaults: {name: "Things", url: ""	},
			fetch:function() {
				var d = util.deferred();
				console.log('source fetching ', this.get('url'), this);
				var c = model.get_rdf(this.get('url'));
				c.fetch().then(function() {
					console.log('calling resolve ');
					d.resolve(c);
				});
				return d.promise(); 
			}
		});
<<<<<<< HEAD
=======
		
		var SourceCollection = Backbone.Collection.extend({
			model:Source // specify model type
			// no need to do this manually, Backbone's model magic
			// automatically converts all json objects passed in
			// to the model types specified above.
			// initialize: function (models, options) {
			//var handler = options.view.addSource.bind(options.view); // ?!?
			//this.bind("add", handler);
			//this.add(models);
			//}
		});		

>>>>>>> 6bff4d4926ca7b2c028d399869b6a1c342d0dca8
		var SourcesView = Backbone.View.extend({
			render:function() {
				var this_ = this;
				this.$el.html(''); 
				this.options.collection.models.map(function(model) {
					try {
						this_.$el.append("<li>" + model.get('name') + "</li>");
					} catch(e) { console.error(e); }
				});
				return this;
			}
		});		

		var SidebarView = Backbone.View.extend({
			events: {
				"click .new_group": "_new_group",
				"click .tab":"toggle_data"
			},
			initialize:function(options) {
				
			},
			_new_group : function() {this.trigger("new_group");	},
			render:function() {
				var sourcec = new SourceCollection(this.options.sources);
				this.$el.find(".sources").append(new SourcesView({
					el: this.$el.find(".sources ul"),
					collection:sourcec
				}).render().el);
				
				var things_view = new tv.TableView({
					el:this.$el.find('.things')[0],
					columns:[
						function(m) {
							var view = new tv.GenericItemView({model:m});
							view.render();
							view.$el.addClass('item').draggable({revert:"invalid", helper:"clone", appendTo:'body'});
							view.$el.data('view',view);
							view.$el.data('model',view.options.model);
							return view.el;
						}
					]
				});
				setTimeout(function() { 
					sourcec.map(function(source) {
						console.log('loading from ', source.get('url'));
						source.fetch().then(function(data) {
							console.log("got data > ", data);
						data.map(function(datum) { things_view.collection.add(datum); });
						});
					});
				}, 1000);
				
			},
			slideOut:function() {
				var this_ = this;
				this.$el.animate({ left: 0 }, function() {	this_.$el.find(".icon-logout-1").addClass("flip-horizontal"); });
				$('.workspace').animate({left:this.$el.find(".datapanel").outerWidth()});
			},
			slideAway:function () {
				var this_ = this;
				this.$el.animate({ left: 8 - this.$el.find(".datapanel").outerWidth()  }, function() {
					this_.$el.find(".icon-logout-1").removeClass("flip-horizontal");
				});
				$('.workspace').animate({left:8});
			},
			toggle_data:function() {
				if ( parseInt(this.$el.css('left'),10) === 0 ){	this.slideAway();	} else { this.slideOut();	}
			}			
		});
<<<<<<< HEAD

		function slideOut () {
			$("#slidepanel").animate({ left: 0 }, function() {
				$("#tab").addClass("flip-horizontal");
			});
		}
		function slideIn () {
			$("#slidepanel").animate({ left: -$("#datapanel").outerWidth() }, function() {
				$("#tab").removeClass("flip-horizontal");
			});
		}
		// set up panel toggle handler
		$("#toggle_data").click(function(){
			if ( parseInt($("#slidepanel").css('left'),10) === 0 ){
				slideIn();
			} else {
				slideOut();
			}
		});
		$("#mainpanel").click(function(){
			slideIn();
		});
		$("li").mouseover(function(e){
			console.log("e", e);
			$(e.target).animate({
				left: -300
			});
		});

		var load = function() {
			var buildings_url = $("#definitions_url").val();
			var data_url = $('#url').val();
			var buildings = model.get_rdf(buildings_url);
			buildings.fetch().then(function() {
				console.log('loaded buildings');
				var data =  model.get_rdf(data_url);
				data.fetch().then(function() {
					console.log(' loaded events ');
					data.each(function(b) { things_view.collection.add(b); });
				});
				buildings.each(function(b) { things_view.collection.add(b); });
			});
			var buildings_source = new Source({ name: "Buildings", url: $("#definitions_url").val()});
			var events_source = new Source({ name: "Events", url: $('#url').val()});
			var sourcesView = new SourcesView();
			var sources = new Sources ( [buildings_source, events_source], {view: sourcesView});
			$("#sources").append(sourcesView.render());
			// expand panel on load
			slideOut();
		};
		$('.load').click(load);
		$('form').submit(load);
		load();
		new_group();
=======
		
		// // ??? don't know what these guys are supposed to do (?)
		//$("li").mouseover(function(e){
		//console.log("e", e);
		//$(e.target).animate({
		//left: -300 
		//});
		//});

		var WorkspaceView = Backbone.View.extend({
			events: {
				'click ':'_workspace_clicked'
			},
			initialize:function() {
				
			},
			render:function() {
				var this_ = this;
				this.sidebar = new SidebarView({
					sources: this.options.data_sources,
					el : this.$el.find('.slidepanel')[0]
				});
				this.sidebar.bind('new_group', function() { this_._new_group(); });
				this.sidebar.render();
				this.sidebar.slideOut();
				this.$el.droppable({
					accept:'.item, .simple',
					tolerance:"touch",
					over:function(event, ui) {
						if (event.target !== this_.el) { return ; }
						console.log("workspace over ", event, ui);
					},
					out:function(event, ui) {},				
					drop: function( event, ui ) {
						if (event.target !== this_.el) { return ; }
						var target_box = this_._new_group();
						target_box.add(box.clone_view(ui.draggable.data("view")));
						event.stopPropagation();
						return false;
					}
			});				
				return this;
			},
			_new_group:function() {
				var box = new ibox.InstanceBox();
				// TODO do something about this --- move out to parent widget
				$('.workspace').append(box.render());
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
			$(".definitions_url").val("http://"+document.location.host+[basepath,'tests','rooms-and-buildings.rdf'].join('/'));
			$(".url").val("http://"+document.location.host+ [basepath,'tests','events-diary.rdf'].join('/'));
			var wview = new WorkspaceView({
				data_sources: [
					//new Source({ name: "Buildings", url: $('.definitions_url').val() }),
					new Source({ name: "Events", url: $('.url').val() })
				],				
				el : $('#box_example')[0]
			});
			wview.render();
			wview.sidebar.slideOut();
		})();
>>>>>>> 6bff4d4926ca7b2c028d399869b6a1c342d0dca8
	});
