define(['js/models', 'js/utils', 'js/sync-nodebox'], function(models, u, nsync) {
	console.log('fb js loading!');
	var c = new Backbone.Collection();
	window._c = c;

	var get_model = function(graph, id) {
		if (!c.get(id)) {
			var m = graph.create(id);
			c.add(m);
		}
		return c.get(id);
	};

	window.save = function() {
		c.models.map(function(thing) {
			console.log('saving this thing > ', thing);
			thing.save();
		});
	};

	var fetch_model = function(graph,id) {
		var m = get_model(graph,id);
		var d = u.deferred();
		if (m._fetched) { d.resolve(m); }
		else if (m._fetching !== undefined) {
			m._fetching.push(d);
		} else {
			m._fetching = [];
			m.fetch().then(function() {
				var dfds = m._fetching;
				delete m._fetching;
				m._fetched = true;
				dfds.concat(d).map(function(dd) { dd.resolve(m); });
			});
		}
		return d;
	};

	var do_obj = function(graph, v) {
		var mm = get_model(graph, v.id || ('object-'+(new Date()).valueOf()));
		delete v.id;
		fetch_model(graph,mm).then(function(mm) {
			console.log("fetch done >>>> ", mm.id);
			mm.set(_transform(graph, v));
			console.log('calling save >>> ', mm.id);
			mm.save();
		});
		return mm;
	};

	var _transform = function(graph, obj) {
		// console.log("_transform ", obj);
		var do_prim = function(v, k) {
			if (!_.isArray(v) && typeof(v) == 'object') {	return do_obj(graph, v); }
			if (k.indexOf('_time') >= 0) {  return new Date(v); }
			return v;
		};
		return u.zip(_(obj).map(function(v,k) {
			if (v === null) { return [k,  undefined]; }
			if (_.isArray(v)) {
				return [k, v.map(function(vx) { return do_prim(vx, k); })];
			}
			if (v.data) {
				return [k, v.data.map(function(vx) { return do_prim(vx, k); })];
			}			
			return [k, do_prim(v,k)];
		}));		
	};
	
	var modes = {
		messages: {
			button:$('#feed'),
			path:'/me/feed',
			to_models:function(graph, resp) {
				return resp.data.map(function(item) { return do_obj(graph, item);	});
			}			
		},
		inbox : {
			button:$('#inbox'),
			path:'/me/inbox',
			to_models:function(graph, resp) {
				return resp.data.map(function(item) {	return do_obj(graph,item);	});
			}
		},		
		friends : {
			button:$('#friends'),
			path:'/me/friends',
			to_models:function(graph, resp) {
				return resp.data.map(function(item) { return do_obj(graph, item);	});
			}
		},
		me : {
			button:$('#me'),
			path:'/me',
			to_models:function(graph, resp) {
				var me = do_obj(graph, resp);
				window.me = me;
				console.log(me);
				return me;
			}
		}		
		
	};

	var initialize= function() {
		var graph = models.get_graph('facebook');
		console.log('initializing ');
		_(modes).map(function(v, mode) {
			console.log(v.button);
			v.button
				.attr("disabled",false)
				.on("click", function() {
					console.log('trying ', mode, '- ', v.path);					
					FB.api(v.path, function(resp) {
						console.log(" response >> ", resp);
						v.to_models(graph, resp);
						// console.log("RESULT > ", result);
					});
				});
		});
	};

	FB.getLoginStatus(function(response) {
		if (response.status === 'connected') {
			// connected
			console.log('connected ');
			initialize();
		} else if (response.status === 'not_authorized') {
			// not_authorized
			console.log('not auth ');
			FB.login(function(resp) {
				if (resp.authResponse) {
					// response
					console.log('response!');
					initialize();
				} else {
					console.log('no response');
					// no response
				}
			}, { perms:'read_stream,read_mailbox,offline_access'});
		} else {
			// not_logged_in
			console.log('not logged in ');
		}
	});	
	return {};
});
