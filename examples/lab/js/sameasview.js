define(['js/utils'],  function(utils) {
	var assert = utils.assert;

	var SameAsRelation = Backbone.Model.extend({
		idAttribute:"_id",
		initialize:function(attrs) {
			this.setModels(attrs.models);
		},
		setModels:function(models) {
			models = _(models).sortBy(function(x) { return x.id; });
			this.set({
				_id: models.map(function(x) { return x.id; }).join('-') || '-no models-'
			});
			console.log('relation ::: set models, ', this.id);			
			this.set({models:models});
			this.trigger('change');
		}
	});

	var SameAsCollection = Backbone.Collection.extend({ model:SameAsRelation });
	
	var SameAsRelationView = Backbone.View.extend({
		tagName:"div",
		className:"sameas-relation",
		template : "<div class='equivs'></div><div class='delete icon-cancel'></div>",
		events:{ 'click .delete': '_cb_delete'	},
		initialize:function() {
			var this_ = this;
			assert(this.options.relation, "relation needs to be defined");
			this.options.relation.on('change', function() { this_.render(); });
		},
		render:function() {
			this.$el.html(this.template);
			var equivs = this.$el.find('.equivs');			
			var t  = "<div class='label'><%= m._get_label() %></div>";
			equivs.append(this.options.relation.get("models").map(function(x) {  return _(t).template({m:x}); }).join(" &#8646; "));
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
					if (this_.views[relation.id]) {
						this_.views[relation.id].remove();
						delete this_.views[relation.id];
					}
				});
		},
		add_to_watch:function(m) {
			var this_ = this;
			m.on('change:sameas', function() {
				// existing selection
				var r = this_.relations.filter(function(rr) {
					return _(m.sameas).union(rr.get('models')).length < m.sameas.length + rr.get('models').length;
				});
				if (m.sameas.length === 0 && r.length > 0) {
					r.map(function(rr) { this_.relations.remove(rr); });
				} else if (m.sameas.length > 0  && r.length === 0) {
					r = [new SameAsRelation({ models: _(m.sameas.concat([m])).uniq() })];
					this_.relations.add(r[0]);
					r[0].on('delete', function() { this_._delete_relation(r[0]); });					
				} else {
					r.map(function(rr) { rr.setModels(_(m.sameas.concat([m])).uniq()); });
				}
			}, this);
		},
		_delete_relation:function(relation) {
			relation.get('models').map(function(m) {
				m.clearSameAs();
			});
			this.relations.remove(relation); // triggers 
		}
	});

	return { SameAsView:SameAsView };
});
