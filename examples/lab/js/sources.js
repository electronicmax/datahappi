define(['examples/lab/js/pathables','js/utils'],  function(pathables,util) {
	var Source = Backbone.Model.extend({
		idAttribute: "name",
		defaults: { name: "Things", url: "" },
	});
	var RDFSource = Source.extend({
		fetch:function() {
			var this_ = this;
			var d = util.deferred();
			var c = pathables.get_rdf(this.get('url'));
			c.fetch().then(function() {
				c.map(function(m) { m.set({source:this_}); });
				d.resolve(c);
			});
			return d.promise(); 
		}		
	});
	var JSONSource = Source.extend({
		fetch:function() {
			var this_ = this;
			var d = util.deferred();
			throw new Error("Can't do yet");
		}		
	});	
	var SourceView = Backbone.View.extend({
		tagName: "li",
		className: "source",
		initialize:function() {}
	});		
	var SourceCollection = Backbone.Collection.extend({
		model:Source
	});
	var get_source = function(name, src_url) {
		var endswith = function(s, suffix) { return s.indexOf(suffix) >= 0 && s.indexOf(suffix) + suffix.length == s.length; }
		if (endswith(src_url, '.rdf')) { return new RDFSource({name:name, url:src_url}); }
		if (endswith(src_url, '.json')) { return new JSONSource({name:name, url:src_url}); }
		throw new Error("can't handle data of type ", src_url);
	};
	return {
		Source:Source,
		RDFSource:RDFSource,
		SourceView:SourceView,
		SourceCollection:SourceCollection,
		get_source:get_source
	};
});
