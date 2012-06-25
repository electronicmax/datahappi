$.couch.urlPrefix = "http://volant.ecs.soton.ac.uk:8000";

function updateSelector(selectorID, populateWith, dVal, optionID) {
	var selector = $("#"+selectorID);
	populateWith({
		success:function(data) {
			selector.empty();
			_(data.rows || data).map(function(datum) {
				selector.append(
					"<option id="+optionID+" value='"+dVal(datum)+"'>"+dVal(datum)+"</option>"
				)
			});
		},
		error: function(e) {
			console.error(e);
		}
	});
}

function updateDBList() {
	updateSelector(
		"existingDatabases",
		function (opts) {$.couch.allDbs.call($.couch, opts);},
		function(db) {return db},
		"dbOption"
	);
}

function updateDocList(db) {
	updateSelector(
		"existingDocs",
		function (opts) {$.couch.db(db).allDocs.call($.couch.db(db), opts);},
		function(doc) {return doc.id},
		"docOption"
	);
}

function addDB(form) {
	var db = form.tableName.value;
	$.couch.db(db).create({
    	success: function(data) {
			updateDBList();
    	},
    	error: function(status) {
        	console.error(status);
    	}
	});
}

function addDoc() {
	var db = $("select[id='existingDatabases'] option:selected").val();
	var docName = $("input#docName").val();
	$.couch.db(db).saveDoc(
		{_id:docName},
		{
    		success: function() {updateDocList(db);},
    		error: function(status) {console.error(status);}
		}
	);
}

function removeDB() {
	var db = $("select[id='existingDatabases'] option:selected").val();
	$.couch.db(db).drop();
	updateDBList();
}

function removeDoc() {
	var db = $("select[id='existingDatabases'] option:selected").val();
	var docName = $("select[id='existingDocs'] option:selected").val();
	$.couch.db(db).openDoc(docName, {
		success: function(doc) {
			$.couch.db(db).removeDoc({
				_id:doc._id,
				_rev:doc._rev
			});
			updateDocList(db);
		},
		error: function(e) {console.error(e)}
	})
}

// Initially populate the database selector.
$(document).ready(function() {
	updateDBList();
	$("form#newTableForm").submit(function(e) {
		e.preventDefault();
		addDB(this);
	});
	$("form#newDocForm").submit(function(e) {
		e.preventDefault();
		addDoc(this);
	});
	// When the selected database changes, update the avaliable document selector.
	$("#existingDatabases").change(function() {
		var db = $("select[id='existingDatabases'] option:selected").val();
		updateDocList(db);
	});
})
