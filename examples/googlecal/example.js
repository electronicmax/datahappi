define(
	[],
	function() {
		var clientID = 848228885173;
		var apiKey = "AIzaSyAlspkJKDkbpqRkvZDED5xT9mjYVJXnUys";
		var scopes = "https://www.googleapis.com/auth/calendar";

		gapi.client.setApiKey(apiKey);
		gapi.auth.authorize(
			{
				client_id: clientID,
				scope: scopes,
				immediate: true
			},
			function(authResult) {
				console.log(authResult);
			}
		);

		/*
		gapi.client.load('calendar', 'v3', function() {
			window.a = gapi.client.calendar.calendars.get("en.uk#holiday@group.v.calendar.google.com");
		});
		*/
	}
);
