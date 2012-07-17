/* this is for the box example only  */
define(
	[
		'js/ui/propertybox/PropertyModel',
		'js/ui/propertybox/PropertyCollection',
		'js/draggableview'
		'js/ui/minibar'
	],
	function(PropertyModel, PropertyCollection, dv) {
		var PropertyView = Backbone.View.extend({
			// paints a nice property.
			tagName:"div",
			className:"property-view",
			template:"<%= name %><div class='coverage-container'><div class='coverage'></div></div><div class='entropy-container'><div class='entropy'></div></div>",
			initialize:function() {
				this.options.model.bind("change:coverage", function() { });
				this.options.model.bind("change:entropy", function() { });
			},
			render:function() {
				this.$el.html(_(template).template(this.options.model.toJSON()));
				this.$el.data("view", this);
				this.$el.data("model", this.options.model);
				return this.el;
			}
			_update_coverage:function() {
				var c = this.options.model.get('coverage');
				this.$el.find('.coverage').css('width',c*100+"%");
			},
			_update_entropy:function() {
				var e = this.options.model.get('entropy');
				this.$el.find('.entropy').css('width',c*100+"%");
			}			
		});
		var PropertyBox = Backbone.View.extend({
			/* @requires: src 'collection' of models to generate properties for -- passed in to options  */
			tagName:"div",
			className:"property-box",			
			template:"", // TODO.
			initialize:function() {
				var this_ = this;
				this.collection = new PropertyCollection(this.options.collection);
				this.collection.bind("change", function() { this_._update(); });
				this.ptov = {};
			},
			render:function() {
				this.$el.html(_(template).template());
				return this.el;
			},
			_update:function() {
				var ptov = this.ptov;
				this.collection.map(function(p) {
					if (ptov[p.id]!) {
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
				});
			}
		});

		return {
			PropertyBox:PropertyBox
		};
	});

