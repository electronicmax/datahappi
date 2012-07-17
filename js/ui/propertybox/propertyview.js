/* this is for the box example only  */
define(
	[
		'js/ui/propertybox/PropertyModel',
		'js/ui/propertybox/PropertyCollection',
		'js/draggableview'
	],
	function(PropertyModel, PropertyCollection, dv) {
		var PropertyView = Backbone.View.extend({
			// paints a nice property.
			template:"<div></div>",
			render:function() {
				return this.el;
			}
		});
		var PropertyBox = Backbone.View.extend({
			/* @requires: src 'collection' of models to generate properties for -- passed in to options  */
			template:"<div></div>", // TODO.
			initialize:function() {
				var this_ = this;
				this.collection = new PropertyCollection(this.options.collection);
				this.collection.bind("change", function() { this_._update(); });
				this.ptov = {};
			},
			render:function() {
				this.$el.html(template);
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

