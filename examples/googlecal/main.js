define(
	['examples/googlecal/auth','examples/googlecal/CalendarCollection'],
	function(authorize, calendar) {
		gapi.client.setApiKey('AIzaSyAlspkJKDkbpqRkvZDED5xT9mjYVJXnUys');
		$(document).ready(function() {
			$('button#loginButton').click(function() {
				authorize(function() {
					calendar.get_calendar().fetch().then(function(collection) {
						window.c = collection;
					});
				});
			});
		});
	}
)
