define(
	[
		'js/box',
		'js/ui/propertybox/propertymodel',
		'js/ui/propertybox/propertycollection'
	],
	function(box, pm, pc) {
		/* The floating box containing the list of clickable properties */
		var PropertyBox = box.BoxView.extend({
			events: {},
			initialize:function() {
				var this_ = this;
				this.property_collection = new pc.PropertyCollection();
				this.property_collection
					.on("change", function() {this_._update();})
					.on("add",function() { this_._update(); })
					.on("remove",function() { this_._update(); });
			},
			render:function() {
				this.ptov = {};
				this.$el.html(_(this.template).template());
				this._update(); // we might have properties already ... so populate them
				return this.el;
			},
			_add_view:function(v) {
				this.$el.append(v.render());
			},
			setPosition:function(x) {
				this.$el.css("top", x.top);
				this.$el.css("left", x.left);
			},
			_update:function(p) {
				var ptov = this.ptov;
				var this_ = this;
				this.property_collection.map(function(p) {
					if (!ptov[p.id]) {
						var pv = pm.PropertyModel.view({model:p, collection:this_.collection});
						ptov[p.id] = pv;
						this_._add_view(pv);
					}
				});
				// remove dead guys
				var tokill = _(_(ptov).keys()).difference(this.collection.map(function(x) { return x.id; }));
				tokill.map(function(pid) {
					var v = ptov[pid];
					v.remove();
					delete ptov[pid];
				});
			}
		});

		return { PropertyBox:PropertyBox };
	}
);

