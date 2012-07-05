//	FeedMap by Peter West
//	MIT Licence
(function ($) {


	var loaded = $.Deferred(),

		readyFunctions = [],

		// List of feeds
		feeds = {},

		layersControl = undefined,

		timeprints = {},

		callOrContent = function (subject, args, defaultValue) {
			if (typeof subject === "undefined") { return defaultValue; }
			if (_(subject).isFunction()) { return subject.apply(undefined, args); }
			return subject;
		},

		makePoint = function (xy) {
			return new L.Point(xy[0], xy[1]);
		},

		startTimeprint = function (name) {
			console.log("Started " + name + "...");
			timeprints[name] = (new Date()).getTime();
		},

		endTimeprint = function (name) {
			var timeEnd = (new Date()).getTime(),
				timeStart = timeprints[name];
			delete timeprints.name;
			console.log("Finished " + name + " in " + ((timeEnd - timeStart) / 1000) + "s.");
		},

		// Get Backbone to handle XML as well as JSON
		Collection = Backbone.Collection.extend({
			initialize: function (collection, options) {
				this.dataType = options.dataType;
				this.contentType = options.contentType;
			},
			sync: function (method, model, options) {
				options = _(options).extend({
					dataType: this.dataType,
					contentType: this.contentType,
					processData: false
				});

				return Backbone.sync.call(Backbone, method, model, options);
			}
		}),

		feedTemplate = '<%= name %><br><small class="datapoints"></small> <small class="updated">Loading...</small> <br>\
			<small><a class="update" href="javascript:;">Refresh</a> \
			<a class="remove" href="javascript:;">Remove</a> <a class="focus" href="javascript::">Zoom to</a></small>',

		FeedView = Backbone.View.extend({
			firstUpdate: true,
			events: {
				"click .update": "update",
				"click .remove": "destroy",
				"click .focus": "focus",
			},
			initialize: function (options) {
				startTimeprint("Initialising");

				var that = this;

				this.template = _.template(feedTemplate);
				this.dataPointLayers = {};

				this.options = _(options).clone();

				this.layerGroup = new L.LayerGroup();

				this.polygons = {};

				if (this.options.collection) {
					this.collection = this.options.collection;
					this.dontUpdate = true;
				} else {
					this.collection = new (Collection.extend({
						url: options.proxy ? feedMap.proxyServer + encodeURIComponent(options.url) : options.url,
						parse: function () {
							endTimeprint("Fetching");
							startTimeprint("Parsing");
							return options.parse.apply(this, arguments);
						}
					}))(undefined, {
						dataType: options.dataType,
						contentType: options.contentType
					});
					if (this.pollRate > 0) {
						this.poller = setInterval(function () {
							that.update();
						}, this.pollRate);
					}
				}

				if (options.hasOwnProperty["poll"]) { this.pollRate = options.poll; }

				this.collection.bind("reset", function () {

					var oldIds = _(that.dataPointLayers).keys(),
						newIds = that.collection.pluck("id"),
						addedIds = _(newIds).difference(oldIds),
						removedIds = _(oldIds).difference(newIds);

					_(addedIds).each(that.createDataPointLayers);
					_(removedIds).each(that.destroyDataPointLayers);

					that.focus();

				}).bind("add", function (m) {
					that.createDataPointLayers(m.id);
					that.focus();
				}).bind("remove", function (m) {
					that.destroyDataPointLayers(m.id);
					that.focus();
				});

				_.bindAll(this, "focus", "destroy", "createDataPointLayers", "addLayers", "removeLayers",
					"addDataPointLayers", "removeDataPointLayers", "destroyDataPointLayers", "addAllDataPointLayers",
					"removeAllDataPointLayers", "destroyAllDataPointLayers", "update");

				this.collection.trigger("reset");

				endTimeprint("Initialising");
			},
			focus: function () {
				if (this.collection.length === 0) { return; }
				startTimeprint("Focusing");
				var latlngs = [], north, east, south, west;

				// Flatten
				_(this.dataPointLayers).each(function (layers) {
					_(layers).each(function (l) {
						if (l._latlng) {
							latlngs.push(l._latlng);
						} else if (l._latlngs) {
							Array.prototype.push.apply(latlngs, l._latlngs);
							return;
						}
					});
				});

				_(latlngs).each(function (latlng) {
					if (typeof south === "undefined" || latlng.lat > south) { south = latlng.lat; }
					if (typeof north === "undefined" || latlng.lat < north) { north = latlng.lat; }
					if (typeof west === "undefined" || latlng.lng < west) { west = latlng.lng; }
					if (typeof east === "undefined" || latlng.lng > east) { east = latlng.lng; }
				}, []);

				feedMap.map.fitBounds(new L.LatLngBounds(new L.LatLng(south, west), new L.LatLng(north, east)));
				endTimeprint("Focusing");
			},
			destroy: function () {
				clearTimeout(this.poller);
				this.destroyAllDataPointLayers();
				this.collection.reset();
				delete this.collection;
				this.$el.remove();
				this.trigger("destroy");
			},
			createDataPointLayers: function (id) {
				if (typeof id === "undefined") { return; }

				var that = this,
					model = this.collection.get(id),
					modelj = model.toJSON(),
					layers = this.dataPointLayers[id] = [];

				if (this.options.showMarkers && modelj.hasOwnProperty("lat") && modelj.hasOwnProperty("lng")) {
					var latLng = new L.LatLng(modelj.lat, modelj.lng)
						mo = this.options.markerOptions,
						icon = new L.Icon({
							iconUrl: callOrContent(mo.iconUrl, [model, modelj]),
							shadowUrl: callOrContent(mo.shadowUrl, [model, modelj]),
							iconSize: makePoint(callOrContent(mo.iconSize, [model, modelj])),
							shadowSize: makePoint(callOrContent(mo.shadowSize, [model, modelj])),
							iconAnchor: makePoint(callOrContent(mo.iconAnchor, [model, modelj])),
							popupAnchor: makePoint(callOrContent(mo.popupAnchor, [model, modelj]))
						}),
						marker = new L.Marker(latLng, { icon: icon });

					model.bind("change", function (m, options) {
						console.log(options)
						if (options.changes.lat || options.changes.lng) {
							var modelj = m.toJSON(),
								newLatlng = new L.LatLng(modelj.lat, modelj.lng);

							/*var delay = 50,
								step = 0.5;
							function animateLatLng (oldll, newll, stepCallback) {
								var olat = oldll.lat,
									olng = oldll.lng,
									nlat = newll.lat,
									nlng = newll.lng,
									dlat = olat < nlat ? step : -step,
									dlng = olng < nlng ? step : -step;

								if (olat)

								stepCallback(newll);
								if () {
									setTimeout(animateLatLng, delay)
								}
							}*/

							//animateLatLng(latlng, newLatlng, function (latlng) {
								marker.setLatLng(newLatlng);
							//});

							if (!options.dontFocus) { that.focus(); }
						}
					})

					layers.push(marker);
				}

				if (this.options.showPolygons) {
					var C = this.options.polygonOptions && this.options.polygonOptions.fill === false ? L.Polyline : L.Polygon;
					if (this.options.polygonOptions && this.options.polygonOptions.groupBy) {

						var group = this.options.polygonOptions.groupBy(model, modelj);

						if (!this.polygons[group]) {
							this.polygons[group] = new C([], {
								color: callOrContent(this.options.polygonOptions.color, [model, modelj], '#f00')
							});
							layers.push(this.polygons[group]); // FIXME: Should be added to some _global_ layer array
						}

						this.polygons[group].addLatLng(new L.LatLng(modelj.lat, modelj.lng));

					} else if (modelj.hasOwnProperty("boundaries")) {
						var boundaries = _(modelj.boundaries).map(function (boundaries) {
							return new L.LatLng(boundaries[0], boundaries[1]);
						});

						layers.push(new C(boundaries));
					}
				}

				if (this.options.renderToMap) {
					Array.prototype.push.apply(this, this.options.renderToMap.call(this, model, modelj));
				}

				if (that.options.showPopup) {
					_(layers).each(function (l) {
						var popup = new L.Popup();
						l.on('click', function (e) {
							var content = callOrContent(that.options.popupOptions.content, [model, modelj], "No content"),
								latlng = l._latlng ? l.getLatLng() : l.getBounds().getCenter();

							popup.setLatLng(latlng);
							popup.setContent(content);

							feedMap.map.openPopup(popup);
						});
					});
				}

				this.addLayers(layers);

				return this;
			},

			addLayers: function (layers) {
				var that = this;
				_(layers).each(function (l) {
					that.layerGroup.addLayer(l);
				});
				return this;
			},
			removeLayers: function (layers) {
				var that = this;
				_(layers).each(function (l) {
					that.layerGroup.removeLayer(l);
				})
				return this;
			},

			addDataPointLayers: function (id) {
				return this.addLayers(this.dataPointLayers[id]);
			},
			removeDataPointLayers: function (id) {
				return this.removeLayers(this.dataPointLayers[id]);
			},
			destroyDataPointLayers: function (id) {
				this.removeDataPointLayers(id);
				delete this.dataPointLayers[id];
				return this;
			},

			addAllDataPointLayers: function () {
				var that = this;
				_(this.dataPointLayers).each(function (layers) {
					that.addLayers(layers);
				});
				return this;
			},
			removeAllDataPointLayers: function () {
				var that = this;
				_(this.dataPointLayers).each(function (layers) {
					that.removeLayers(layers);
				});
				return this;
			},
			destroyAllDataPointLayers: function () {
				var that = this;
				_(this.dataPointLayers).each(function (layers, id) {
					that.destroyDataPointLayers(id);
				});
			},

			render: function () {
				this.$el.html(this.template({ name: this.options.name }));
				return this;
			},
			update: function () {
				if (this.dontUpdate) { return this; }
				startTimeprint("Fetching");
				var that = this,
					$updated = this.$(".updated").html(that.firstUpdate ? "Loading..." : "Refreshing...");

				this.collection.fetch().done(function () {
					endTimeprint("Parsing");
					if (that.firstUpdate) {
						that.firstUpdate = false;
					}
					$updated.html("Updated at " + (new Date()).toTimeString());
					that.$(".datapoints").html(that.collection.length + " data points.")
				}).fail(function () {
					$updated.html("Could not retrieve feed");
				});
				return this;
			}
		}),

		feedMap = window.feedMap = {
			scriptRoot: "js/",
			proxyServer: "http://localhost:9292/?url=",

			map: undefined,

			load: function (jsUrl) {
				return jQuery.ajax({
		            crossDomain: true,
		            dataType: "script",
		            url: feedMap.scriptRoot + jsUrl + ".js"
		        }).fail(function () { console.log("Failed to load") });
			},

			addFeed: function (id, feed) {
				if (feeds.hasOwnProperty(id)) {
					throw "Feed with id \"" + id + "\" has already been loaded.";
					return;
				}
				feedMap.ready(function () {
					var feedView = new FeedView(feed);
					feeds[id] = feedView;
					$("#feeds").append(feedView.render().update().el);
					layersControl.addOverlay(feedView.layerGroup, feedView.options.name);
					feedMap.map.addLayer(feedView.layerGroup);
					feedView.on("destroy", function () {
						delete feeds[id];
					});
				});
			},

			removeFeed: function (id) {
				var feedView = feeds[id];
				feedView.destroy();
				//layersControl.removeOverlay(feedView.layerGroup);
				console.log("remove overlay")
				feedMap.map.removeLayer(feedView.layerGroup);
			},

			ready: function (f) {
				if (loaded.isResolved()) {
					f.call();
				} else {
					readyFunctions.push(f);
				}
			}
		};

	$.when(loaded).done(function () {
		_(readyFunctions).each(function (f) { f.call(); });
	}).fail(function () {
		console.error("Failed to load map")
	});

	// Initialise map
	$(document).ready(function () {
		// Map things
		feedMap.map = new L.Map('map');
		layersControl = new L.Control.Layers();

		feedMap.map
			// Awesome CloudMade maps
			.addLayer(new L.TileLayer('http://{s}.tile.cloudmade.com/285675b50972436798d67ce55ab7ddde/997/256/{z}/{x}/{y}.png', {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://cloudmade.com">CloudMade</a>',
				maxZoom: 18
			}/*, {styleId: 997}*/))

			// Centre map at London
			.setView(new L.LatLng(51.505, -0.09), 13)

			// Add the control to allow switching on/off of feeds
			.addControl(layersControl);

		loaded.resolve();
	});

	$.when(loaded).done(function () {
		_(readyFunctions).each(function (f) { f.call(); });
	}).fail(function () {
		console.error("Failed to load map")
	});

}(jQuery));