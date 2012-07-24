/* this is for the box example only  */
define(
	[
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
					//new Source({ name: "Buildings", url: "http://"+document.location.host+[basepath,'tests','rooms-and-buildings.rdf'].join('/') }),
					new Source({ name: "Events", url: "http://"+document.location.host+ [basepath,'tests','events-diary.rdf'].join('/') })
				],				
				el : $('#box_example')[0]
			});
			wview.render();
			wview.sidebar.slideOut();
		})();
	});

