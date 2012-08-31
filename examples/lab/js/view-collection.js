define([],function() {
	/*
	  It's really a pain in the butt to keep views in
	  collections. This makes it a little bit easier.
	*/		   
	var ViewCollection = Backbone.Collection.extend({
		initialize:function() {},
		get_views:function() {
			return Backbone.Collection.prototype.map(function(x) { return x.attributes; });
		},
		get:function(p, x) {
			var val = Backbone.Collection.prototype.get.apply(this,arguments);
			if (val) { return val.attributes; }
		},
		at:function() {
			var m = Backbone.Collection.prototype.at.apply(this,arguments);
			if (m) { return m.attributes; }
		},
		add:function(v,x) {
			var val = Backbone.Collection.prototype.add.apply(this,arguments);						
			var this_ = this;
			if (!_(v).isArray()) { v = [v]; }
			v.map(function(vv) { vv.on('all', function(eventName) { this_.trigger.apply(this_,arguments); }, this_);});
			return val;
		},
		remove:function(v) {
			var this_ = this;
			if (!_(v).isArray()) { v = [v]; }
			var vids = v.map(function(x) { return x.cid; });
			var to_kill = this.models.filter(function(x) {
				return vids.indexOf(x.attributes.cid) >= 0;
			});
			var val = Backbone.Collection.prototype.remove.apply(this,[to_kill]);
			to_kill.map(function(vv) { vv.attributes.off(null, null, this_); });
			return val;
		},
		map:function(fn) {
			return this.models.map(function(x) { return fn(x.attributes); });
		},
		filter:function(fn) {
			return this.models.filter(function(x) { return fn(x.attributes); }).map(function(x) { return x.attributes; });
		},
		reduce:function(fn, initial) {
			return this.models.reduce(function(x) { return fn(x.attributes); }, initial);
		}
	});

	return {
		ViewCollection:ViewCollection
	};

});
	   
