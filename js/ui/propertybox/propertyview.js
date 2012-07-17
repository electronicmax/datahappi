/* this is for the box example only  */
define(
	[
		'js/ui/propertybox/propertycollection',
		'js/draggableview'
	],
	function(propertycollection, dv) {
		var PropertyView = Backbone.View.extend({
			// paints a nice property.
			tagName:"div",
			className:"property-view",
			template:"<%= name %><div class='coverage-container'><div class='coverage'></div></div><div class='entropy-container'><div class='entropy'></div></div>",
			initialize:function() {
				var this_ = this;
				this.options.model.bind("change:coverage", function() { this_._update_coverage(); });
				this.options.model.bind("change:entropy", function() { this_._update_entropy(); });
			},
			render:function() {
				this.$el.html(_(template).template(this.options.model.toJSON()));
				this.$el.data("view", this);
				this.$el.data("model", this.options.model);
				this._update_coverage();
				this._update_entropy();
				return this.el;
			},
			_update_coverage:function() {
				var c = this.options.model.get('coverage');
				this.$el.find('.coverage').css('right',(this.$el().width() * (1-c))+"px");
			},
			_update_entropy:function() {
				var e = this.options.model.get('entropy');
				this.$el.find('.entropy').css('right',(this.$el().width() * (1-e))+"px");
			}			
		});
		
		var PropertyBox = Backbone.View.extend({
			/* @requires: src 'collection' of models to generate properties for -- passed in to options  */
			tagName:"div",
			className:"property-box",			
			template:"", // TODO.
			initialize:function() {
				var this_ = this;
				// propertycollections contain propertymodels
				this.collection = new propertycollection.PropertyCollection({collection:this.options.collection});
				this.collection.bind("change", function() { this_._update(); });
				this.ptov = {};
			},
			render:function() {
				this.$el.html(_(template).template());
				return this.el;
			},
			setPosition:function() {
				this.$el.css("top", x.top);
				this.$el.css("left", x.left);
  		    },
			_update:function() {
				var ptov = this.ptov;
				this.collection.map(function(p) {
					if (!ptov[p.id]) {
						var pv = new PropertyView({model:p})
						ptov[p.id] = pv;
					}
					ptov[p.id].render();
				});
				// remove dead guys
				_(ptov).keys().difference(this.collection.map(function(x) { return x.id; }).map(function(pid) {
					var v = ptov[pid];
					v.remove();
					delete ptov[pid];
				}));
			}			
		});
		return { PropertyBox:PropertyBox };
	});

