/* this is for the box example only  */
define(
	[
	'js/ui/instancebox',
	'js/draggableview',
	'js/ui/tableview',
	'js/models',
	'js/utils',
	'js/googlecal/CalendarCollection',
	'js/googlecal/auth'
	],
	function(box, dv, tv, model, util, cc, auth) {
		var path = document.location.pathname;
		var basepath = path.slice(0,path.lastIndexOf('/')); // chop off 2 /'s
		basepath = basepath.slice(0,Math.max(0,basepath.lastIndexOf('/'))) || '/';

		var Source = Backbone.Model.extend({
			defaults: {name: "Things", url: ""	},
			fetch:function() {
				var d = util.deferred();
				var c = model.get_rdf(this.get('url'));
				c.fetch().then(function() {
					console.log('calling resolve ');
					d.resolve(c);
				});
				return d.promise(); 
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
				"click .toggle_data":"toggle_data"
			},
			initialize:function(options) {
				
			},
			_new_group : function() {
				var bv = new box.InstanceBox();
				// TODO do something about this --- move out to parent widget
				$('#mainpanel').append(bv.render());
			},
			render:function() {
				var sourcec = new SourceCollection(this.options.sources);
				this.$el.find(".sources").append(new SourcesView({
					el: this.$el.find(".sources ul"),
					collection:sourcec
				}).render().el).append(new SliderView().render().el);
				
				var things_view = new tv.TableView({
					el:this.$el.find('table')[0],
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
				sourcec.map(function(source) {
					console.log('loading from ', source.get('url'));
					source.fetch().then(function(data) {
						console.log("got data > ", data);
						data.map(function(datum) { things_view.add(datum); });
					});
				});
				
			},
			slideOut:function() {
				var this_ = this;
				this.$el.animate({ left: 0 }, function() {	this_.$el.find(".tab").addClass("flip-horizontal"); });
			},
			slideIn:function () {
				var this_ = this;
				this.$el.animate({ left: - this.$el.find(".datapanel").outerWidth() }, function() {
					this_.$el.find(".tab").removeClass("flip-horizontal");
				});
			},
			toggle_data:function() {
				console.log('toggle_data');
				if ( parseInt(this.$el.css('left'),10) === 0 ){	this.slideIn();	} else { this.slideOut();	}
			}			
		});
		// ---		
		var load = function() {
			var buildings = new Source({	name: "Buildings", url: "http://"+document.location.host+[basepath,'tests','rooms-and-buildings.rdf'].join('/') });
			var events = new Source({ name: "Events", url: "http://"+document.location.host+ [basepath,'tests','events-diary.rdf'].join('/') });
			var sbv = new SidebarView({
				sources: [buildings, events],
				el : $('.slidepanel')[0]
			});
		
			$("#mainpanel").click(function(){
				sbv.slideIn();
			});

			$(".slider ul").css( 'width', function() { 
				return 310 * $(this).children().length;
			});

			console.log('calling render');
			sbv.render();
			console.log(' done rendering ');
			sbv.slideOut();
			// sbv._new_group();
		};
		load();
	});

