/*
  fb-nodebox startup script
*/

var host = document.location.host;
var channelURL = '//'+host+'/channel.html';
console.log('checking for channel file at ', channelURL);
// Additional JS functions here
window.fbAsyncInit = function() {
	FB.init({
		appId      : '296646860441717', // App ID
		channelUrl : channelURL, // Channel File
		status     : true, // check login status
		cookie     : true, // enable cookies to allow the server to access the session
		xfbml      : true  // parse XFBML
	});
	// Additional init code here
	var path = document.location.pathname;
	var basepath = path.slice(0,path.lastIndexOf('/')); // chop off 2 /'s
	basepath = basepath.slice(0,Math.max(0,basepath.lastIndexOf('/'))) || '/';
	console.log('setting baseurl to ', document.location.pathname, '-', basepath);
	require.config({ baseUrl:  basepath });	  
	require(['js/sync-nodebox','plugins/js/saveface','js/models'], function(sync, fb, models) {
		console.log('loaded fb'); window.models = models;
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


