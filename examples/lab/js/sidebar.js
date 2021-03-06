define(['js/source','examples/lab/js/views','js/ui/tableview','examples/lab/js/sameasview','examples/lab/js/inventory-view','js/utils'],function(sources,views,tv,sameas,inventory,util) {
	
	var defined = util.DEFINED, flatten = util.flatten, deferred = util.deferred, when = util.when;
	
	var ThingsView = tv.TableView.extend({
		columns:[
			function(m) {
				var view = new views.ThingListItemView({model:m});
				view.render();
				return view;
			}
		],
		setSourceEnabled:function(src) {
			var els = _(this.row_views)
				.values()
				.map(function(rv) {
					return rv.options.model.model.get("source")[0].id == src.id ? rv.el : undefined;
				})
				.filter(defined);
			$(els).show();
		},
		setSourceDisabled:function(src) {
			var els = _(this.row_views).values()
				.map(function(rv) {
					return rv.options.model.model.get("source")[0].id == src.id ? rv.el : undefined;
				})
				.filter(defined);
			$(els).hide();
		}		
	});


	var SourcesView = Backbone.View.extend({
		events : {
			"click .new-source-add-button" : "_show_source_url",
			"keyup .new-source-url" : "_add_source",
			"click .source-entry" : "_toggle_source"
		},
		initialize:function() {
			var this_ = this;
			this.options.collection.bind('add', function(m) { this_._add(m); });
			if (this.options.sidebar) {
				this.options.sidebar.bind('slideAway', function() { this_._hide_source_url(); });
			}
		},
		render:function() {
			var this_ = this;
			this.$el.find('ul').html('');
			this.options.collection.models.map(function(model) { this_._add(model);	});
			return this;
		},
		_add:function(m){
			var name = m.get('name') && m.get('name').length > 0 ? m.get('name') : m.id.slice(m.id.lastIndexOf('/') + 1);
			var new_src = $("(<li class='source-entry selected'>" + name + "</li>");
			this.$el.find('ul').append(new_src);
			new_src.data("model", function() { return m; });
		},
		_toggle_source:function(evt) {
			var source = $(evt.target).data('model')();
			this.trigger($(evt.target).hasClass('selected') ? 'source-disabled' : 'source-enabled', source);
			$(evt.target).toggleClass('selected');
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

	var SidebarView = Backbone.View.extend({
		events: {
			"click .tab":"toggle_data"
		},
		initialize:function(options) {
			console.assert(this.options.el, "must provide an el for sidebar");
			this.sources = new sources.SourceCollection(this.options.sources);
		},
		render:function() {
			var this_ = this;
			var sv = new SourcesView({el: this.$el.find('.sources'), collection:this.sources, sidebar: this}).render(); 
			var sameas_view = (new sameas.SameAsView({el:this.$el.find('.sameas-view')[0] })).render();
			// we need to watch any new models created by the sources,
			// and tell our sameas watcher.
			var watch_model = function(m) {
				// console.log(" >>>>>>>>>> creating a new model, registering it >>>>>>> ", m.id );
				sameas_view.add_to_watch(m);
			};
			
			this.sources.map(function(src) { src.on('new-model', watch_model, this); });			
			this.sources.on('add', function(src) {	src.on('new-model', watch_model, this);			})
				.on('remove', function(src) { src.off('all', null, this); });

			var things = new Backbone.Collection();
			var deferreds = [];
			
			this_.sources.map(function(src) {
				var d = deferred();
				deferreds.push(d);				
				src.fetch().then(function(data) {
					data.map(function(datum) { things.add(datum); });
					d.resolve();
				});
			});

			when(deferreds).then(function() {
				console.log("Making an inventory view");
				var things_view = new inventory.InventoryView({
					el:this_.$el.find('.things')[0],
					collection:things
				}).render();				
				sv.on('source-enabled', function(src) { things_view.setSourceEnabled(src);  });
				sv.on('source-disabled', function(src) { things_view.setSourceDisabled(src);  });				
			});

			return this;			
		},
		slideOut:function() {
			if ((this._slider_animation && this._slider_animation.state() !== 'resolved') || this.isVisible()) { return; }
			var this_ = this, sliderd = util.deferred(), workspaced = util.deferred();
			this.$el.animate({ left: 0 }, function() {
				this_.$el.find(".icon-logout-1").addClass("flip-horizontal");
				sliderd.resolve();
			});
			$('.workspace').animate({ left:this.$el.find(".datapanel").outerWidth()	}, workspaced.resolve);
			this.trigger('slideOut');				
			return this; // this._slider_animation = util.whend([sliderd,workspaced]);
		},
		slideAway:function () {
			if ((this._slider_animation && this._slider_animation.state() !== 'resolved') || !this.isVisible()) { return; }
			var this_ = this, sliderd = util.deferred(), workspaced = util.deferred()	;			
			this.$el.animate({ left: 8 - this.$el.find(".datapanel").outerWidth()  }, function() {
				this_.$el.find(".icon-logout-1").removeClass("flip-horizontal");
				sliderd.resolve();
			});
			$('.workspace').animate({left:8}, workspaced.resolve);
			this.trigger('slideAway');				
			return this; // this._slider_animation = util.whend([sliderd,workspaced]);
		},
		isVisible:function() {
			return parseInt(this.$el.css('left'),10) === 0;
		},
		toggle_data:function() {
			return this.isVisible() ? this.slideAway() : this.slideOut();
		}			
	});

	return {
		SidebarView:SidebarView
	};
});
