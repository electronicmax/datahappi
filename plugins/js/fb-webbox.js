
var channelURL = '//'+host+'/channel.html';
console.log('checking for channel file at ', channelURL);

// Additional JS functions here
window.fbAsyncInit = function() {
	FB.init({
		appId	  : '296646860441717', // App ID
		channelUrl : channelURL, // Channel File
		status	 : true, // check login status
		cookie	 : true, // enable cookies to allow the server to access the session
		xfbml	  : true  // parse XFBML
	});
	// Additional init code here
	var path = document.location.pathname;
	var basepath = path.slice(0,path.lastIndexOf('/')); // chop off 2 /'s
	basepath = basepath.slice(0,Math.max(0,basepath.lastIndexOf('/'))) || '/';
	console.log('setting baseurl to ', document.location.pathname, '-', basepath);
	require.config({ baseUrl:  basepath });
	require(['plugins/fb', 'js/models'], function(nodebox, fb, models) {
		$.getScript('http://'+host+':8211/js/objectstore.js', function() {
	  		var store = new ObjectStore.Store();
			store.server_url = "http://"+host+":8211/webbox/";
			var graph = store.get("http://example.com/graph");
			graph.fetch().success(function() {
				console.log('ok to run fb code!');
				console.debug("graph", graph);
				var boo = graph.create({"@id": "123982388", "eats": "pizza"});
				//				  var boo = new ObjectStore.Obj({"@id":123982389});
				//				 graph.get("objects").add(boo);
				boo.save();				
			}).error(function(err)  {
				console.log('error in fetch ', err);
			});
	 	});
	});
};
// Load the SDK Asynchronously
(function(d){
	var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement('script'); js.id = id; js.async = true;
	js.src = "//connect.facebook.net/en_US/all.js";
	ref.parentNode.insertBefore(js, ref);
}(document));

