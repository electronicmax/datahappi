/* this is for the box example only  */
define(
	[
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

		var Source = Backbone.Model.extend({
			name: "Things",
			url: ""
		});
		var Sources = Backbone.Collection.extend({
			initialize: function (models, options) {
				var handler = options.view.addSource.bind(options.view);
				this.bind("add", handler);
				this.add(models);
			}
		});
		var SourceView = Backbone.View.extend({
			tagName: "li",
			className: "source",
			initialize:function() {
				}
		});
		
		var SourceCollection = Backbone.Collection.extend({
			model:Source
		});		

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

		var SliderView = Backbone.View.extend({
			tagName: "div",
			className: "slider",
			initialize:function() {
				var this_ = this;
				this.$el.html('<ul style="width:620px"><li><span id="sourcetype" contenteditable>Add a source</span></li>' +
					'<li> &gt; <span id="sourcetype" contenteditable>New source url</span></li></ul>');
				this
				this.$el.find("#sourcetype").keypress(function(e) {
					if(e.which == 13) {
						var li = this_.$el.find("li")[0];
						$(li).css('width', 'auto');
						e.preventDefault();
						return false;
					}
				});
			},
			render:function() {
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
				}).render().el).append(new SliderView().render().el);
				
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
						source.fetch().then(function(data) {
							data.map(function(datum) { things_view.collection.add(datum); });
						});
					});
				}, 1000);
				
			},
			slideOut:function() {
				if ((this._slider_animation && !this._slider_animation.isResolved()) || this.isVisible()) { return; }
				var this_ = this, sliderd = util.deferred(), workspaced = util.deferred();
				this.$el.animate({ left: 0 }, function() {
					this_.$el.find(".icon-logout-1").addClass("flip-horizontal");
					sliderd.resolve();
				});
				$('.workspace').animate({ left:this.$el.find(".datapanel").outerWidth()	}, workspaced.resolve);
				return this._slider_animation = util.whend([sliderd,workspaced]);
			},
			slideAway:function () {
				if ((this._slider_animation && !this._slider_animation.isResolved()) || !this.isVisible()) { return; }
				var this_ = this, sliderd = util.deferred(), workspaced = util.deferred()	;			
				this.$el.animate({ left: 8 - this.$el.find(".datapanel").outerWidth()  }, function() {
					this_.$el.find(".icon-logout-1").removeClass("flip-horizontal");
					sliderd.resolve();
				});
				$('.workspace').animate({left:8}, workspaced.resolve);
				return this._slider_animation = util.whend([sliderd,workspaced]);
			},
			isVisible:function() {
				return parseInt(this.$el.css('left'),10) === 0;
			},
			toggle_data:function() {
				this.isVisible() ? this.slideAway() : this.slideOut();
			}			
		});

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
		// // ---		
		(function() {
			// prepopulate all the things! 
			$(".definitions_url").val("http://"+document.location.host+[basepath,'tests','rooms-and-buildings.rdf'].join('/'));
			$(".url").val("http://"+document.location.host+ [basepath,'tests','events-diary.rdf'].join('/'));
			var wview = new WorkspaceView({
				data_sources: [
					//new Source({ name: "Buildings", url: "http://"+document.location.host+[basepath,'tests','rooms-and-buildings.rdf'].join('/') }),
					new Source({ name: "Events", url: "http://"+document.location.host+ [basepath,'tests','events-diary.rdf'].join('/') })
				],				
				el : $('#box_example')[0]
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
	});
