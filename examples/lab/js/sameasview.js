define(['js/utils'],  function(utils) {
	var assert = utils.assert;

	var SameAsRelation = Backbone.Model.extend({
		idAttribute:"_id",
		initialize:function(attrs) {
			var models = _(attrs.models).sortBy(function(x) { return x.id; });
			this.set({
				_id: models.map(function(x) { return x.id; }).join('-')
			});
			this.set({models:models});
		}
	});

	var SameAsCollection = Backbone.Collection.extend({ model:SameAsRelation });
	
	var SameAsRelationView = Backbone.View.extend({
		tagName:"div",
		className:"sameas-relation",
		template : "<div class='label'><%= m[0].get_label() %></div> &#8646; <div class='label'><%= m[1].get_label() %></div> <div class='delete icon-cancel''></div>",
		events:{ 'click .delete': '_cb_delete'	},
		initialize:function() {
			assert(this.options.relation, "relation needs to be defined");
		},
		render:function() {
			this.$el.html(_(this.template).template({ m : this.options.relation.get("models") }));
			return this;
		},
		_cb_delete:function() { this.trigger('delete'); }
	});	
	
	var SameAsView = Backbone.View.extend({
		initialize:function() {
			var this_ = this;
			this.views = {};
			this.relations = new SameAsCollection();
			this.relations
				.on('add', function(relation) {
					this_.views[relation.id] = new SameAsRelationView({relation:relation});
					this_.$el.find('.relations').append(this_.views[relation.id].render().el);
					this_.views[relation.id].on('delete', function() {
						this_._delete_relation(relation);
					});
				})
				.on('remove', function(relation) {
					// does the nasty work of updating views etc
					this_.views[relation.id].remove();
					delete this_.views[relation.id];
				});
		},
		add_to_watch:function(m) {
			var this_ = this;
			m.on('change:sameas', function() {
				m.sameas.map(function(x) {
					var sr = new SameAsRelation({ models: [m,x] });
					if (_(this_.relations.get(sr)).isUndefined()) {
						this_.relations.add(sr);
						sr.on('delete', function() { this_._delete_relation(sr); });
					}
				});
			}, this);
		},
		_delete_relation:function(relation) {
			var m0 = relation.get('models')[0],	m1 = relation.get('models')[1];
			m0.unsetSameAs(m1); 
			this.relations.remove(relation); // triggers 
		}
	});

	return { SameAsView:SameAsView };
});
