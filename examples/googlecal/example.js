function load() {
	gapi.client.setApiKey('AIzaSyAlspkJKDkbpqRkvZDED5xT9mjYVJXnUys');
	gapi.client.load('calendar', 'v3', makeRequest);
}

function makeRequest() {
	window.a = gapi.client.calendar
}

$(document).ready(function() {
	window.getCalView = new Backbone.View({
		el:$("form#getCalForm")
	});
	$('input#getCalSubmit').click(function(event) {
		event.preventDefault();
		var accountName = $('input#getCalText').val();
		gapi.client.calendar.calendars.get(accountName).execute();
	});
});
