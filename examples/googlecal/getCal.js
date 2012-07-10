define(
	[],
	function() {
		var getEventCollection;
		return (function(calendarId, callback) {
			gapi.client.load('calendar', 'v3', function() {
				var eventCollection;
				var request = gapi.client.calendar.events.list({
					'calendarId':calendarId
				})
				request.execute(function(eventList) {
					callback(
						new Backbone.Collection(
							eventList.items.map(function(event) {
								return new Backbone.Model(event);
							})
						)
					);
				});
			});
			return this;
		});
	}
);

