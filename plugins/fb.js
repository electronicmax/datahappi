define([], function() {
	console.log('fb js loading!');
	FB.getLoginStatus(function(response) {
		if (response.status === 'connected') {
			// connected
			console.log('connected ');
			FB.api('/me/feed', function(resp) {
				console.log(resp);
				window.me = resp;
			});
		} else if (response.status === 'not_authorized') {
			// not_authorized
			console.log('not auth ');
			FB.login(function(resp) {
				if (resp.authResponse) {
					// response
					console.log('response!');
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
