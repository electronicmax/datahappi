define(
	[],
	function() {
		var config = {
			'client_id': '848228885173',
			'scope': 'https://www.googleapis.com/auth/calendar',
			'approval_prompt' : 'force'
		};
		return (function(callback) {
			gapi.auth.authorize(config, function() {
				callback();
				return gapi.auth.getToken();
			});
		});
	}
);

