define(
	[],
	function() {
		"use strict";
		var CalendarCollection = Backbone.Collection.extend({
			fetch:function() {
				var that = this;
				var deferred = new $.Deferred()
				gapi.client.load('calendar', 'v3', function() {
					gapi.client.calendar.calendarList.list().execute(function(calendarList) {
						that.reset(
							calendarList.items.map(function(event) {
								return new Backbone.Model(event);
							})
						);
						deferred.resolve(that);
					});
				});
				return deferred;
			}
		});
		return {
			CalendarCollection:CalendarCollection,
			get_calendar:function(){return new CalendarCollection()}
		}
	}
);

