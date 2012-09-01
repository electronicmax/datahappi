define(['js/utils'],  function(utils) {
	var assert = utils.assert;

	var SameAsRelation = Backbone.Model.extend({
		idAttribute:"_id",
		initialize:function(attrs) {
			this.setModels(attrs.models);
			this.set({ _id: (new Date()).valueOf() });
		},
		setModels:function(models) {
			models = _(models).sortBy(function(x) { return x.id; });
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
		_cb_delete:function() {
			this.trigger('delete');
		}
	});	
	
	var SameAsView = Backbone.View.extend({
		initialize:function() {
			var this_ = this;
			this.views = {};
			this.relations = new SameAsCollection();
			this.relations
				.on('add', function(relation) {	this_._handle_add(relation);	})
				.on('remove', function(relation) { this_._handle_remove(relation); });
		},
		_handle_add:function(relation) {
			var this_ = this;
			this_.views[relation.id] = new SameAsRelationView({relation:relation});
			this_.$el.find('.relations').append(this_.views[relation.id].render().el);
			this_.views[relation.id].on('delete', function() {
				this_._delete_relation(relation);
			});
		},
		_handle_remove:function(relation) {
			var this_ = this;
			console.log('handle remove > ', relation.id, this.views[relation.id]);
			if (this_.views[relation.id]) {
				this_.views[relation.id].remove();
				delete this_.views[relation.id];
			}			
		},		
		add_to_watch:function(m) {
			var this_ = this;
			m.on('change:sameas', function() {
				// existing relations

				var new_equiv_models = _(m.sameas.concat([m])).uniq();

				//				console.log('chang sameas ', new_equiv_models);

				var cur_r = this_.relations.filter(function(rr) {
					return _(new_equiv_models).intersection(rr.get('models')).length >= 0;
				});

				// enter selection
				if (cur_r.length === 0 && m.sameas.length > 0) {
					this_.relations.add(new SameAsRelation({ models: new_equiv_models }));
				}

				// update
				cur_r.map(function(r) {
					r.setModels(new_equiv_models);
				});

				// exit selection
				if (cur_r.length > 0 && m.sameas.length === 0) {
					cur_r.map(function(r) { this_.relations.remove(r); });
				} 				

				/*
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
				*/
			}, this);
		},
		_delete_relation:function(relation) {
			this.relations.remove(relation); // triggers
			relation.get('models').map(function(m) { m.clearSameAs(); });
		},
		render:function() {
			var this_ = this;
			this.$el.data('view', this);
			this.relations.map(function(x) { this_._handle_add(x); });
			// TODO : discover all of the relations we have in our 
			return this;
		}
	});

	return { SameAsView:SameAsView };
});
