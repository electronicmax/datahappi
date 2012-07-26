/* this is for the box example only  */
define(
	[
		'js/ui/propertybox/propertycollection',
		'js/box',
		'js/pathables',
	],
	function(pc, box, pathables) {
		/* A selectable area showing a property which may be made the next step in a
		 * path for one or more pathables.
		 *
		 * Required options:
		 * property: String
		 * pathables: pathables.Pathables */
		var PropertyView = Backbone.View.extend({
			events: {
				'click .propmodel' : '_propclick'
			},
			tagName:"div",
			className:"property-view",
			template:"<div class='propmodel'><%= _id %><div class='coverage-container'><div class='coverage'></div></div><div class='entropy-container'><div class='entropy'></div></div></div>",
			initialize:function() {
				var this_ = this;
				this.property_collection = new pc.PropertyCollection();
				this.options.model.bind("change:coverage", function() { this_._update_coverage(); });
				this.options.model.bind("change:entropy", function() { this_._update_entropy(); });
			},
			render:function() {
				this.$el.html(_(this.template).template(this.options.model.toJSON()));
				this.$el.data("view", this);
				this.$el.data("model", this.options.model);
				this._update_coverage();
				this._update_entropy();
				return this.el;
			},
			_update_coverage:function() {
				var c = this.options.model.get('coverage');
				this.$el.find('.coverage').css('right',(this.$el.width() * (1-c))+"px");
			},
			_update_entropy:function() {
				var e = this.options.model.get('entropy');
				this.$el.find('.entropy').css('right',(this.$el.width() * (1-e))+"px");
			},
			_propclick: function(x) {
				this.options.collection.chain_forwards(this.options.model.get("_id"));
			}
		});

		var PropertyViewCollection = Backbone.Collection.extend({

		});

		var PropertyBox = box.BoxView.extend({
			events: {},
			initialize:function() {
				var this_ = this;
				this.property_collection = new PropertyViewCollection();
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
						var pv = new PropertyView({model:p, collection:this_.collection});
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
	});

