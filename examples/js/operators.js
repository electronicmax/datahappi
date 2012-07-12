// TODO: On button click, load google calendar collection into table and show lat/longs.
define([
		'js/rdf/RDFCollection',
		'js/ops/chain-engine',
		'js/utils',
		'js/googlecal/CalendarCollection',
		'js/googlecal/auth',        
		'js/ui/TableView'
	], function(rdfc, ce, util, cc,  tv, auth) {
		
		var v = new tv.TableView({el:$('.main')[0]});
		var load = function() {
			var buildings_url = $("#definitions_url").val();
			var data_url = $('#url').val();
			console.log('buildings ', buildings_url);
			console.log('data ', data_url);
			var buildings = ce.get_rdf_collection(buildings_url);
			window.buildings = buildings;
			buildings.fetch().then(function() {
				console.log('loaded buildings');
				var data =  ce.get_rdf_collection(data_url);
				data.fetch().then(function() {
					console.log(' loaded events ');
					data.each(function(b) { v.collection.add(b); });
				});
				buildings.each(function(b) { v.collection.add(b); });
			});
		};
		$('.load').click(load);
		$('form').submit(load);
		window.rdf = rdfc;
		window.ce = ce;
		window.view = v;
		load();
		
		// TODO: On button click, load google calendar collection into table and show lat/longs.
		$('button#loadGCal').click(function() {
			auth(function(x) {
				cc.get_calendar().fetch().then(function(calCollection) {
					calCollection.models.map(function(calendar) {
						calendar.eventCollection.fetch().then(function(eventCollection) {
							eventCollection.models.map(function(event) {
								v.collection.add(ce.to_chain_model(event));
							});
						});
					});
				});
			});
		});
		return {};
	}
);

