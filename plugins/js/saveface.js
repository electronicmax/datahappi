define(['plugins/fb', 'js/utils'],function(fb,js) {

	var Router = Backbone.Router.extend({
		routes: {
			'login' : 'login',
			'store' : 'store',
			'denied' : 'denied',
			'': 'start',
			
		},
		start:function() {
			console.log('>> mode start--');
			var this_ = this;
			FB.getLoginStatus(function(response) {
				if (response.status === 'connected') {
					// connected
					console.log('connected -- proceeding to navigate ');
					fb.initialize();
					this_.nav('store');
				} else { // if (response.status === 'not_authorized') {
					this_.nav('login');
				} 
			});			
		},
		login:function() {
			console.log('>> mode login --');
			var this_ = this;
			$('.box').not('.login').fadeOut('slow', function(){ $('.login').fadeIn(); });
		},
		store:function() {
			console.log('>> mode store --');
			var this_ = this;
			FB.getLoginStatus(function(response) {
				if (response.status === 'connected') { fb.initialize();} else { this_.nav(''); }
			});
			$('.box').not('.controls').fadeOut('slow', function() { $('.controls').fadeIn('slow');  });
		},
		denied:function() {
			console.log('>> mode denied --');
			var this_ = this;
			$('.box').not('.denied').fadeOut('slow', function() { $('.denied').fadeIn();  });
		},
		nav:function(state) {
			this.navigate(state, {trigger:true});
		}
	});

	$('#login').on('click', function() {
		FB.login(function(resp) {
			if (resp.authResponse) { _router.nav('store'); } else { _router.nav('/denied');	}
		}, { perms:'read_stream,read_mailbox,offline_access'});
	});	
	$('#logoff').click('click', function() {
		console.log('logging out');
		FB.logout(); _router.nav('login');
	});
	
	
	// FB.getLoginStatus(function(response) {
	// 	if (response.status === 'connected') {
	// 		// connected
	// 		console.log('connected ');
	// 		initialize();
	// 	} else if (response.status === 'not_authorized') {
	// 		// not_authorized
	// 		console.log('not auth ');
	// 		FB.login(function(resp) {
	// 			if (resp.authResponse) {
	// 				// response
	// 				console.log('response!');
	// 				initialize();
	// 			} else {
	// 				console.log('no response');
	// 				// no response
	// 			}
	// 		}, { perms:'read_stream,read_mailbox,offline_access'});
	// 	} else {
	// 		// not_logged_in
	// 		console.log('not logged in ');
	// 	}
	// });

	console.log('starting router ---------------------->');
	var _router = (new Router());
	window._router = _router;
	console.log('setting root to be', document.location.pathname);
	Backbone.history.start({root:document.location.pathname});
	// _router.navigate('');

	return {
		router : _router
	};
	
});
