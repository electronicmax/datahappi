define(
	[],
	function() {
		gapi.client.setApiKey('AIzaSyAlspkJKDkbpqRkvZDED5xT9mjYVJXnUys');
		gapi.client.load('calendar', 'v3', function() {
			window.a = gapi.client.calendar.calendars.get("jskinner.mail@gmail.com");
			console.log(data);
		});
	}
);
