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
                                var _convert_val = function(v,k) {
                                    if (!_(v).isArray()) { v = [v]; }
                                    return v.map(function(vv) {
                                        // value specific coercion here e.g., date time formats to our date time format
                                        return vv;
                                    });
                                };
                                var _convert_event = function(evt) {
                                    // converts an entire event
                                    var new_evt = {};
                                    _(evt).keys().map(function(k) {
                                        new_evt[k] = _convert_val(evt[k],k);                                        
                                    });
                                    return new_evt;
                                };                            
				gapi.client.load('calendar', 'v3', function() {
					gapi.client.calendar.events.list({calendarId:that._id}).execute(function(eventList) {
						that.reset(eventList.items.map(function(evt) { return _convert_event(evt); }));
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

