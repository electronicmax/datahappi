define(
	[
		'examples/lab/js/sources',
		'examples/lab/js/views',		
		'js/ui/tableview',
		'js/utils'
	],
	function(sources,views,tv,util) {
		
	var SourcesView = Backbone.View.extend({
		events : {
			"click .new-source-add-button" : "_show_source_url",
			"keyup .new-source-url" : "_add_source",
			"click .source-entry" : "_toggle_source"
		},
		initialize:function() {
			var this_ = this;
			this.options.collection.bind('add', function(m) { this_._add(m); });
			if (this.options.sidebar) { this.options.sidebar.bind('slideAway', function() { this_._hide_source_url(); }); }
		},
		render:function() {
			var this_ = this;
			this.$el.find('ul').html(''); 
			this.options.collection.models.map(function(model) { this_._add(model);	});
			return this;
		},
		_add:function(m) {
			var new_src = $("(<li class='source-entry'>" + m.get('name') + "</li>");
			this.$el.find('ul').append(new_src);
			new_src.data("model", m);
		},
		_toggle_source:function(evt) {
			console.log('toggle src ', evt, evt.target, evt.currenTarget, $(evt.target).data('model'));
			var source = $(evt.target).data('model');
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
			// must
			console.assert(this.options.el, "must provide an el for sidebar");
		},
		render:function() {
			var sourcec = new sources.SourceCollection(this.options.sources);
			var sv = new SourcesView({el: this.$el.find('.sources'), collection:sourcec, sidebar: this}).render(); 
			var things_view = new tv.TableView({
				el:this.$el.find('.things')[0],
				columns:[
					function(m) {
						var view = new views.ThingListItemView({model:m});
						view.render();
						// make this draggable
						view.$el.draggable({revert:"invalid",helper:"clone",appendTo:'body'});
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
			return this;			
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
			return this.isVisible() ? this.slideAway() : this.slideOut();
		}			
	});

	return {
		SidebarView:SidebarView
	};
});
