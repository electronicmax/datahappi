define(
	['examples/googlecal/auth','examples/googlecal/CalendarCollection','js/rdf/RDFCollection', 'js/ops/chain-engine'],
	function(authorize, calendar, rdfc, ce) {
		'strict mode';
		gapi.client.setApiKey('AIzaSyAlspkJKDkbpqRkvZDED5xT9mjYVJXnUys');
		$(document).ready(function() {
			$('button#loginButton').click(function() {
				authorize(function() {
					calendar.get_calendar().fetch().then(function(calCollection) {
						window.c = calCollection;
						rdfc.get_rdf('http://hip.cat/misc/rooms-and-buildings.rdf').fetch().then(function(eCollection) {
							window.eCollection= eCollection;
						});
					});
				});
			});
		});
	}
)
