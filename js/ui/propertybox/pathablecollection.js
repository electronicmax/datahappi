define(
	[
		'js/utils',
		'js/ops/chain-engine',
		'js/pathables'
	],
	function(util, ce, pathables) {
		/* A set of pathables pointed to by a view which all may be chained on a
		 * specific property. Must handle the pathing on pathables once its
		 * PropertyView has been clicked.
		 *
		 * Required options:
		 * property: String
		 * pathables: pathables.Pathables */
		var PathableCollection = Backbone.Collection.extend({
			model:pathables.Pathable,
			initialize:function(models, options) {
				var this_ = this;
				this.property = options.property;
				this.pathables = options.pathables;
				util.assert(
					!_(this.property).isUndefined(),
					"PathableCollection was not passed a property (String)");
				util.assert(
					!_(this.pathables).isUndefined(),
					"PathableCollection was not passed a pathables (pathables.Pathables)");

				// TODO: Entropy and coverage calcs can be made more efficient by storing values and only changing them when a single pathable is added or removed.
				this.pathables
					.on('add', function(p) { this_._change_add(p); })
					.on('remove', function(p) { this_._change_remove(p); })
					.on('change', function() {
						this_._update_coverage();
						this_._update_entropy();
					}).map(function(p) {
						this_._change_add(p);
					});
			},
			_change_remove:function(pathable) {
				// If a pathable does not exist in the pathables collection, it cannot exist in this collection.
				this.trigger("change");
				this.trigger("remove", pathable);
				this.remove(pathable);
			},
			_change_add:function(pathable) {
				// If a pathable is added which may be chained on this property, add it to this collection.
				var chainedPathable = pathable.get_last_value();
				if (_.isObject(chainedPathable) && _.keys(chainedPathable.attributes).indexOf(this.property) > -1) {
					this.trigger("change");
					this.trigger("add", pathable);
					this.add(pathable);
				}
			},
			/*
			_update_coverage:function() {
				var c = this.options.model.get('coverage');
				this.$el.find('.coverage').css('right',(this.$el.width() * (1-c))+"px");
			},
			_update_entropy:function() {
				var e = this.options.model.get('entropy');
				this.$el.find('.entropy').css('right',(this.$el.width() * (1-e))+"px");
			}
			*/
			_update_coverage:function() {
				var coverage = this.pathable_collection.models.length * 1.0/this.pathables.length;
				this.set({'coverage': coverage});
			},
			_update_entropy:function() {
				var values = this.pathable_collection.map(function(p) {
					return to_base_value(p.get(this.property));
				});
				var entropy = _.uniq(values).length * 1.0 / values.length;
				this.set({'entropy': entropy});
			}
		});
		return { PathableCollection:PathableCollection };
	}
);

