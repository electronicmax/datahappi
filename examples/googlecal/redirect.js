define(
	[],
	function() {
		url = "https://accounts.google.com/o/oauth2/auth?";
		url += "response_type=token";
		url += "&redirect_uri=http://localhost/datahappi/examples/googlecal/example.html";
		url += "&scope=https://www.googleapis.com/auth/calendar";
		url += "&approval_prompt=force";
		url += "&client_id=848228885173.apps.googleusercontent.com";

		window.location.replace(url);
	}
);
