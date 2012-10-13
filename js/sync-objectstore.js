/**
   dh-webbox sync module
   first cut at specification implementation
**/
define(['js/utils'], function(u) {
	var url = 'http://'+document.location.host + ":8215";
	var oldsync = Backbone.sync;
	var conv = function(v) {
		if ( v instanceof Backbone.Model ) { return { "@id" : v.id }; }
		return { "@value": v.valueOf() };
	};
	var serialize_model = function(model) {
		var obj = u.zip(model.keys().map(function(k) {
			var v = model.get(k);
			if ($.isArray(v)) {	return [k, v.map(conv)]; }
			return [k, [conv(v)]];
		}));
		obj['@id'] = model.id;
		obj['@previous_version'] = model.version || 0;
		delete obj._id;
		return obj;
	};
	var deserialize = function(json, uri, graph) {
		var raw = json;
		var unpack_one = function(l) {
			if (typeof(l) == 'object' && l['@value']) {
				// TODO:: something better to unpack
				return l['@value'];
			}
			if (typeof(l) == 'object' && l['@id']) {
				return [k, graph.get_or_create(rawv['@id'])];
			}
			return l;
		};
		var pairs = _(raw).keys().map(function(k) {
			var rawv = raw[k];
			if ($.isArray(rawv)) {
				return [k, rawv.map(function(x) { return unpack_one(x);	})];
			} else {
				return [k, unpack_one(rawv)];
			}
		});
		return u.zip(pairs);
	};	
	var put = function(model, pass_in_opts) {
		var d = new $.Deferred();
		var stripped = serialize_model(model);
		var put_url = [
			url,
			'?graph=' + model.graph.id
		].join('/');								   
		options = {
			type:'PUT',
			url:put_url,
			data:JSON.stringify([stripped]),
			contentType:'application/json',
			processData:false
		};
		console.log('calling ajax with options ', options.data);
		$.ajax(options).success(
			function(data, status, xHR) {
				console.log('response type ', data, typeof(data));
				if (data.length > 0 && data[0] && data[0]['@version']) {
					console.log('updating version to ', data[0]['@version']);
					model.version = data[0]['@version'];
				}
				d.resolve(model)
				if (pass_in_opts.success) { pass_in_opts.success(model); }
			}).error(function(message) {
				console.error("put ERROR > ", message);
				d.reject();
				if (pass_in_opts.error) { pass_in_opts.error(message); }
			});
		return d;
	};
	var methods = {
		'create': put,
		'update': put,		
		'read': function(model, options) {
			console.log('read ', model, 'ignoring options ', options);
			options = { type:'GET', url:url, data:{uri:model.id}, processData:true};
			var d = new $.Deferred();
			$.ajax( options )
				.success(function(response, xHR) {
					console.log('get response >> ', response, typeof(response), xHR);
					var new_model = deserialize(JSON.parse(response));

					// process thingies
					if (new_model['@version']) {
						model.version = new_model['@version'];
						delete new_model['@version'];
					}
					delete new_model['@id'];
					
					// now diff things in ---------
					var enter_keys = _(_(new_model).keys()).difference(model.keys()).map(function(k) {
						model.set(k,new_model[k])
					});
					var same_keys = _(_(new_model).keys()).intersection(model.keys()).map(function(k) {
						model.set(k,new_model[k])
					});
					var exit_keys = _(model.keys()).difference(_(new_model).keys()).map(function(k) {
						model.unset(k);
					});					
					if (response) {	model.parse(response);}
					if (options.success) { options.success(model); }
					d.resolve(model); 
				}).error(function(response, xHR) {
					console.error('sync.READ error > ', response, xHR);
					if (options.error) { options.error(response); }
					d.fail(response);
				});
			return d;
			// return oldsync(method, model, _(options).chain().clone().extend(options).value());
		},
		'delete': function() {}		
	};
	Backbone.sync = function(method, model, options) {
		console.log('method is ', method, 'model is ', model);
		if (methods[method]) {
			return methods[method](model,options);
		}
	};
});
