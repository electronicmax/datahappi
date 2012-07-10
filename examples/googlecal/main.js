define(
	['examples/googlecal/auth','examples/googlecal/getCal'],
	function(authorize, calendar) {
		gapi.client.setApiKey('AIzaSyAlspkJKDkbpqRkvZDED5xT9mjYVJXnUys');
		$(document).ready(function() {
			$('button#loginButton').click(function() {
				authorize(function() {
					calendar('jskinner.mail@gmail.com', function(d) {console.log(d);});
				});
			});
		});
	}
)
