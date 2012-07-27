define(
	[
		'js/box',
		'js/ui/propertybox/propertymodel',
		'js/ui/propertybox/propertycollection',
		'js/ui/propertybox/propertyview'
	],
	function(box, pm, pc, pview) {
		/* The floating box containing the list of clickable properties for a patricular Pathables collection.
		 *
		 * Required options:
		 * pathables: Pathables */
		var PropertyBox = box.BoxView.extend({
			events: {},
			initialize:function() {
				var this_ = this;

				// TODO: See if the line '.on("add", _update_add)' works too.
				this.options.pathables
					.on("add", function(p) {this_._update_add(p)})
					.on("remove", function(p) {this_._update_remove(p)});
				/*
				this.property_collection = new pc.PropertyCollection();
				this.property_collection
					.on("change", function() {this_._update();})
					.on("add",function() { this_._update(); })
					.on("remove",function() { this_._update(); });
				*/
			},
			render:function() {
				console.log("Rendering PropertyBox");
				/*
				this.ptov = {};
				this.$el.html(_(this.template).template());
				this._update(); // we might have properties already ... so populate them
				return this.el;
				*/
				this.constructor.__super__.render.apply(this);
				this.$el.append($(toolbar_template)); // TODO: this doesn't exist anywhere?
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
			},
			_update_add:function(pathable) {
				pathable.attributes.map(function(attribute) {
					if (!this.views_collection.get(attribute)) {
						this.views_collection.add(new pview.PropertyView({
							property:attribute,
							pathables:this.options.pathables
						}));
					}
				});
			},
			_update_remove:function(propModel) {
				// TODO: Remove the view from the box.
			}
		});

		return { PropertyBox:PropertyBox };
	}
);

