define(
	[],
	function() {
		"use strict";
		var EventCollection = Backbone.Collection.extend({
			initialize:function(id) {
				this._id = id;
			},
			fetch:function() {
				var that = this;
				var deferred = $.Deferred();
				gapi.client.load('calendar', 'v3', function() {
					gapi.client.calendar.events.list({calendarId:that._id}).execute(function(eventList) {
						that.reset(eventList.items);
						deferred.resolve(that);
					});
				});
				return deferred;
			}
		});

		var CalendarModel = Backbone.Model.extend({
			initialize:function(calendar) {
				this.eventCollection = new EventCollection(calendar.id)
			}
		});

		var CalendarCollection = Backbone.Collection.extend({
			model:CalendarModel,
			fetch:function() {
				var that = this;
				var deferred = new $.Deferred()
				gapi.client.load('calendar', 'v3', function() {
					gapi.client.calendar.calendarList.list().execute(function(calendarList) {
						that.reset(calendarList.items);
						deferred.resolve(that);
					});
				});
				return deferred;
			}
		});
		return {
			CalendarCollection:CalendarCollection,
			CalendarModel:CalendarModel,
			EventCollection:EventCollection,
			get_calendar:function(){return new CalendarCollection()}
		}
	}
);

