/**
   dh-webbox sync module
   first cut at specification implementation
**/
define(['js/utils'], function(u) {
	var url = 'http://'+document.location.host + ":8215/";
	var oldsync = Backbone.sync;

	var conv = function(v) {
		if ( v instanceof Backbone.Model ) { return { "@id" : v.id }; }
		return { "@value": v.valueOf() };
	};
	var serialize_model = function(model) {
		var obj = u.zip(model.keys().map(function(k) {
			var v = model.get(k);
			console.log(' getting ', k, model.get(v));
			if ($.isArray(v)) {
				return [k, v.map(conv)];
			}
			return [k, [conv(v)]];
		}));
		obj['@id'] = model.id;
		obj['@prev_ver'] = model.version || 0;
		delete obj._id;
		return obj;
	};	
	var put = function(model, pass_in_opts) {
		console.log('put ', model);
		var d = new $.Deferred();
		var stripped = serialize_model(model);
		options = {
			type:'PUT',
			url:url,
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
			options = {url:url, data:{id:model.id}, processData:true};
			var d = new $.Deferred();
			d.get( options )
				.success(function(response, xHR) {
					console.log('get response >> ', response, typeof(response), xHR);
					if (response) {	model.parse(response);}
				}).error(function(response, xHR) {
					console.error('sync.READ error > ', response, xHR);
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
