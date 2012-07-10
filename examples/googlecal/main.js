define(
	['examples/googlecal/auth','examples/googlecal/CalendarCollection','js/rdf/RDFCollection'],
	function(authorize, calendar, rdfc) {
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
