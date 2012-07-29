/* this is for the box example only  */
define(
	[
		'examples/lab/js/pathables',
		'examples/lab/js/box',
		'examples/lab/js/instancebox',
		'examples/lab/js/views',
		'js/ui/tableview',
		'js/utils',
		'js/googlecal/CalendarCollection',
		'js/googlecal/auth',
	],
	function(pathables, box, ibox, views, tv, util, cc, auth) {
		var Source = Backbone.Model.extend({
			idAttribute: "name",
			defaults: { name: "Things", url: "" },
			fetch:function() {
				var this_ = this;
				var d = util.deferred();
				var c = pathables.get_rdf(this.get('url'));
				c.fetch().then(function() {
					c.map(function(m) { m.set({source:this_}); });
					d.resolve(c);
				});
				return d.promise(); 
			}
		});
		var SourceView = Backbone.View.extend({
			tagName: "li",
			className: "source",
			initialize:function() {}
		});		
		var SourceCollection = Backbone.Collection.extend({
			model:Source
		});		
		var SourcesView = Backbone.View.extend({
			events : {
				"click .new-source-add-button" : "_show_source_url",
				"keyup .new-source-url" : "_add_source",
			},
			initialize:function() {
				var this_ = this;
				this.options.collection.bind('add', function(m) { this_._add(m); });
				if (this.options.sidebar) { this.options.sidebar.bind('slideAway', function() { this_._hide_source_url(); }); }
			},
			render:function() {
				var this_ = this;
				this.$el.find('ul').html(''); 
				this.options.collection.models.map(function(model) {
					this_._add(model);
				});
				return this;
			},
			_add:function(m) {
				this.$el.find('ul').append("<li>" + m.get('name') + "</li>");
			},
			_show_source_url:function() {
				console.log('showing it ', this.$el.find('.new-source-url'));
				this.$el.find('.new-source-url').slideDown();
			},
			_hide_source_url:function() {
				this.$el.find('.new-source-url').slideUp().val('');
			},																 
			_add_source:function(event) {
				if (event.keyCode!==13) { return; }
				var v = this.$el.find('.new-source-url').val();
				this._hide_source_url();				
				var newsrc = { name : v.length > 10 ? v.slice(0, 10) + '...' : v, url: v };
				this.options.collection.add(newsrc);
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
				var sv = new SourcesView({el: this.$el.find('.sources'), collection:sourcec, sidebar: this}).render(); // .append(new SliderView().render().el);
				var things_view = new tv.TableView({
					el:this.$el.find('.things')[0],
					columns:[
						function(m) {
							var view = new views.ThingListItemView({model:m});
							view.render();
							view.$el.addClass('item').draggable({revert:"invalid", helper:"clone", appendTo:'body'});
							return view;
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
				this.trigger('slideOut');				
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
				this.trigger('slideAway');				
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
			var path = document.location.pathname;
			var basepath = path.slice(0,path.lastIndexOf('/')); // chop off 2 /'s
			basepath = basepath.slice(0,Math.max(0,basepath.lastIndexOf('/'))) || '/';
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

