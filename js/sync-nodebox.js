/**
   dh-webbox sync module
   first cut at specification implementation
**/
define(['js/serialise', 'js/utils'], function(serials,u) {
	var url = 'http://'+document.location.host + ":8888";
	var oldsync = Backbone.sync;
	
	var put = function(model, pass_in_opts) {
		var serialised = serials.serialize(model);
		var put_url = [url,'nodebox?g=' + encodeURIComponent(model.graph.id)].join('/');		
		var options = {
			type:'PUT',
			url:put_url,
			data:JSON.stringify([serialised]),
			contentType:'application/json',
			processData:false
		};
		var d = u.deferred();		
		return $.ajax(options).success(
			function(data, status, xHR) {
				if (data.length > 0 && data[0] && data[0].version) {
					model.version = data[0].version;
				}
				if (pass_in_opts.success) { pass_in_opts.success(model); }
				d.resolve(model);				
			}).error(function(error) {
				console.error("ERROR > ", error);
				if (pass_in_opts.error) {pass_in_opts.error(message);}
				d.reject(error);
			});
		return d.promise();
	};

	var get = function(model, pass_in_opts) {
		// console.log('read ', model, 'ignoring pass_in_opts ', pass_in_opts);
		var options = {
			type:'GET', url:[url, 'get'].join('/'),
			data:{id:model.id, g:model.graph && model.graph.id ? model.graph.id : undefined},
			processData:true
		};
		var d = u.deferred();
		$.ajax( options ).success(function(response, xHR) {
			if (response == '{}') { return d.resolve(model); }
			var new_model = serials.deserialize(response, model.graph);
			if (pass_in_opts.success) { pass_in_opts.success(new_model.attributes); }
			d.resolve(model);
		}).error(function(response, xHR) {
			console.error('sync.READ error > ', response, xHR);
			if (pass_in_opts.error) { pass_in_opts.error(response); }
			d.reject(response);
		});
		return d.promise(); // override return so jxHR overriden 
	};

	var methods = {
		'create': put,
		'update': put,		
		'read': get,
		'delete': function() {}		
	};
	
	Backbone.sync = function(method, model, options) {
		if (methods[method]) {
			return methods[method](model,options);
		}
	};
});


/*
  			// now diff things in ---------
			var enter_keys = _(new_model.keys()).difference(model.keys()).map(function(k) {
				model.set(k,new_model.get(k));
			});
			var same_kvs = _(new_model.keys()).intersection(model.keys()).map(function(k) {
				return [k, new_model.get(k)];
			});
			var changed_hash = model.changedAttributes(u.zip(same_kvs));
			model.set(changed_hash, {silent:true});
			var exit_keys = _(model.keys()).difference(new_model.keys()).map(function(k) {
				model.unset(k, {silent:true});
			});					

*/
