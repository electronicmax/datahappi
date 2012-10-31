define(['js/utils'], function(u) {
	return {
		SaveWatcher: Backbone.Model.extend({
			initialize:function() {
				this.counts = { all: 0 };
			},
			_update_counts: function(m) {
				if (m.attributes.type) {
					var stype = m.attributes.type.toString();
					this.counts[stype] = this.counts[stype] ? this.counts[stype]+1 : 1;
				}
				this.counts.all = this.counts.all+1;
				this.trigger('update', this.counts);
				console.log('counts >> ', this.counts);
			},
			register: function(m) {
				var this_ = this;
				m.on('save', function() { this_._update_counts(m); });
			}
		})
	};
});
