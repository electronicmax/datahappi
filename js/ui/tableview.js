define(['js/utils'], function(util) {

	var TABLEVIEW_DEFAULT_COLUMNS = [
		function(m) { return (new GenericItemView({model:m})).render(); },
		function(m) {
			return _(m.attributes).keys().map(
				function(x) {
					var start = Math.max(0,x.lastIndexOf('/') + 1,x.lastIndexOf('#') + 1);
					return x.slice(start);
				}).join(',');
		},
		function(m) {
			if (! m.get_chain) { return 'model does not have \'get_chain\' method'; }
			var vals = m.get_chain(['latitude','longitude']);
			if (vals && vals.length > 0) {
				return util.t("<%= latitude %>, <%= longitude %>", vals[0].attributes);
			} else {
				var names = m.get_chain(['place name']);
				if (names && names.length > 0) {
					return names[0].get('place name');
				} else {
					return 'could not chain to lat/long or place name';
				}
			}
			return ' ? ';
		}
	];
	
	var GenericItemView = Backbone.View.extend({
		tagName:'div',
		className:'instance',
		template:$('#instance_template').text(),
		initialize:function() {},
		render:function() {
			this.$el.html(
				_(this.options.template || this.template).template({m:this.options.model.toJSON()})
			);
			return this.el;
		}
	});
	
	var RowView = Backbone.View.extend({
		tagName:'tr',
		initialize:function() {},
		render:function() {
			var m = this.options.model;
			var this_ = this;
			this.$el.html('');
			_(this.options.columns).map(function(val) {
				var oldVal = $.extend({}, val);
				if (_(val).isFunction()) { val = val(m); return arguments.callee(val); }
				if (val && val.el) {
					this_.$el.append(val.el); return val;
				}
				if (_.isArray(val) && val.length === 1) { val = val[0]; } //If val is a single vlaue array, take the value out of the array.
				if (_.isUndefined(val)) { val = '<i>undefined</i>'; }
				if (_(val).isNumber()) { val = val.toString(); }
				if (_(val).isObject() && val instanceof Backbone.Model) { val = val.attributes._id || val.attibutes._oid; }
				if (_(val).isObject() && !_(val).isElement()) { console.log(oldVal); val = "non-element object"; } // return if val is an object, but not if it is an element object
				if (_(val).isString() || _(val).isElement()) { // jQuery can handle html strings and element objects.
					$("<td></td>").append(val).appendTo(this_.el);
				} else {
					console.error("Could not convert ", val);
					$("<td></td>").append("error").appendTo(this_.el);
				}
			});
			return this.el;
		},
		hide:function() { this.$el.hide(); },
		show:function() { this.$el.show(); }
	});


	var TableView = Backbone.View.extend({
		// default columns that could be overridden
		columns: TABLEVIEW_DEFAULT_COLUMNS,
		initialize:function() {
			var this_ = this;
			this.collection = this.options.model || new Backbone.Collection();
			this.row_views = {};
			this.collection.on("add", function(x) {	this_._handle_add(x);});
			this.collection.on("remove", function(x) { this_._handle_remove(x);	});
			this.options.columns = this.options.columns || this.columns;
		},
		_handle_add:function(m) {
			if (this.row_views[m.id] !== undefined) { throw new Error("Cannot add view twice"); }
			var rw = new RowView({model:m, columns:this.options.columns});
			this.row_views[m.id] = rw;
			this.$el.find('tbody').append(rw.render());
		},
		_handle_remove:function(m) {
			var this_ = this;
			if (this.row_views[m.id]) {
				this.row_views.hide().then(function() {
					this_.row_views.remove();
					delete this_.row_views[m.id];
				});
			}
		},
		render:function() {	return this.el;	}
	});

	return {
		TableView : TableView,
		GenericItemView: GenericItemView
	};
});






