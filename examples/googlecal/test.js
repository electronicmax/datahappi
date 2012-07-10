define(
	[],
	function() {
		$(document).ready(function() {
			$('button#loginButton').click(function() {
				setTimeout(function() {
					gapi.auth.authorize(config, function() {
						console.log(gapi.auth.getToken());
						gapi.client.load('calendar', 'v3', function() {
							gapi.client.calendar.events.list({
								//'calendarId':'en.uk#holiday@group.v.calendar.google.com'
								'calendarId':'jskinner.mail@gmail.com'
							}).execute(function(eventList) {
								window.e = eventList;
								eventList.items.map(function(event) {
									$('body').append("<br>"+event.summary);
								});
							});
						});
					});
				}, 1);
			});
		});
	}
);

