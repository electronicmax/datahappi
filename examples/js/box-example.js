/* this is for the box example only  */
define([ 'js/ui/instancebox','js/draggableview',	'js/ui/tableview',	'js/rdf/RDFCollection',	'js/ops/chain-engine',	'js/utils',	'js/googlecal/CalendarCollection', 'js/googlecal/auth' ], function(box, dv, tv, rdfc, ce, util, cc, auth) {
	var path = document.location.pathname;
	var basepath = path.slice(0,path.lastIndexOf('/')); // chop off 2 /'s
	basepath = basepath.slice(0,Math.max(0,basepath.lastIndexOf('/'))) || '/';

	var new_group = function() {
		var bv = new box.InstanceBox();
		$('#things').append(bv.render());
	};
	
	$("#definitions_url").val("http://"+document.location.host+[basepath,'tests','rooms-and-buildings.rdf'].join('/'));
	$("#url").val("http://"+document.location.host+ [basepath,'tests','events-diary.rdf'].join('/'));
	$('#new_group').click(new_group); 
	// $('body').prepend((new dv.Simple()).render());
	var v = new tv.TableView({
		el:$('table')[0],
		columns:[
			function(m) {
				var view = new tv.GenericItemView({model:m});
				view.render();
				view.$el.addClass('item').draggable({revert:"invalid", helper:"clone", appendTo:'body'});
				view.$el.data('view',view);
				view.$el.data('model',view.options.model);
				return view.el;
			}
		]
	});
	var load = function() {
		var buildings_url = $("#definitions_url").val();
		var data_url = $('#url').val();
		var buildings = ce.get_rdf_collection(buildings_url);
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
    new_group();
});

