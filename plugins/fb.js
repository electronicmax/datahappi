define(['js/models', 'js/utils', 'js/sync-nodebox'], function(models, u, nsync) {
	var c = new Backbone.Collection();
	var get_model = function(graph, id) {
		if (!c.get(id)) {
			var m = graph.create(id);
			c.add(m);
		}
		return c.get(id);
	};
	window.get_fb = function(uri) { return get_model(models.get_graph('facebook'), uri); };
	// debug only -----------------------------------------------------|

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
		var d = u.deferred();
		var mm = get_model(graph, v.id || ('object-'+(new Date()).valueOf()));
		delete v.id;
		fetch_model(graph,mm).then(function(mm) {
			var tval = _transform(graph, v);
			mm.set(tval, undefined, {silent:true});
			if (mm.changedAttributes()) {
				console.log('changed attributes -- calling save >>> ', mm.id);
				mm.save().then(function() { d.resolve(); });
			} else { console.log(mm.id, ' no changed attributes '); d.resolve(); }
		});
		return { model: mm, dfd: d.promise() };
	};

	var _transform = function(graph, obj) {
		// console.log("_transform ", obj);
		var do_prim = function(v, k) {
			if (!_.isArray(v) && typeof(v) == 'object') { return do_obj(graph, v).model; }
			if (k.indexOf('_time') >= 0) {  return new Date(v); }
			return v;
		};
		return u.zip(_(obj).map(function(v,k) {
			if (v === null) { return [k,  undefined]; }
			if (_.isArray(v)) { return [k, v.map(function(vx) { return do_prim(vx, k); })]; 	}
			if (v.data) {	return [k, v.data.map(function(vx) { return do_prim(vx, k); })];}			
			return [k, do_prim(v,k)];
		}));		
	};
	
	var modes = {
		messages: {
			button:$('#feed'),
			path:'/me/feed',
			to_models:function(graph, resp) {
				return u.when(resp.data.map(function(item) { return do_obj(graph, item).dfd; }));
			}			
		},
		inbox : {
			button:$('#inbox'),
			path:'/me/inbox',
			to_models:function(graph, resp) {
				return u.when(resp.data.map(function(item) { return do_obj(graph,item).dfd; }));
			}
		},		
		friends : {
			button:$('#friends'),
			path:'/me/friends',
			to_models:function(graph, resp) {
				return u.when(resp.data.map(function(item) { return do_obj(graph, item).dfd;	}));
			}
		},
		friends : {
			button:$('#friends'),
			path:'/me/friends',
			to_models:function(graph, resp) {
				var _me = arguments.callee;
				var result = u.when(resp.data.map(function(fid) {
					var d = u.deferred();
					if (fid && fid.id) {
						console.log('getting more info for -- ', fid.id, fid.name);
						FB.api(fid.id, function(resp) {  do_obj(graph, resp).dfd.then(d.resolve).fail(d.reject);   });
					} else { d.reject(); }
					return d.promise();
				}));
			}
		},
		statuses: {
			button:$('#statuses'),
			path:'/me/statuses',
			to_models:function(graph, resp) {
				return u.when(resp.data.map(function(item) { return do_obj(graph, item).dfd;	}));
			}
		},		
		me : {
			button:$('#me'),
			path:'/me',
			to_models:function(graph, resp) { return do_obj(graph, resp).dfd;	}
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
					var this_ = this;
					$(this_).attr('disabled',true);
					var check = function(path) {
						var _me = arguments.callee;
						var d = u.deferred();
						FB.api(path, function(resp) {
							if (u.defined(resp)) {
								v.to_models(graph, resp).then(function() {
									if (resp.paging && resp.paging.next) {
										_me(resp.paging.next).then(d.resolve).fail(d.reject);
									} else {
										d.resolve();
									}
								}).fail(function(err) {
									console.error('error coming back from to_models ', err );
									d.reject(err);
								});
							}
						});
						return d.promise();
					};
					check(v.path).then(function() {
						$(this_).attr('disabled',false);
					}).fail(function(err) {
						console.error('FAIL with ', mode, err);
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
