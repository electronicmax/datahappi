"""
	This script, when run, should ask you to authenticate within a browser then
	spit out all your FB stuff in JSON format. It'll be quite big so you'll
	probably want to redirect stdout to a file.

	Requires fbconsole, which requires a couple more things, all of which I
	managed to install with pip.
"""

import sys
import urllib2
import fbconsole
import json

fbconsole.AUTH_SCOPE = [
	"user_about_me",
	"user_activities",
	"user_birthday",
	"user_checkins",
	"user_education_history",
	"user_events",
	"user_groups",
	"user_hometown",
	"user_interests",
	"user_likes",
	"user_location",
	"user_notes",
	"user_photos",
	"user_questions",
	"user_relationships",
	"user_relationship_details",
	"user_religion_politics",
	"user_status",
	"user_subscriptions",
	"user_videos",
	"user_website",
	"user_work_history",
	"email"
]

sys.stderr.write(fbconsole.authenticate())

connectors = [
	"friends",
	"home",
	"feed",
	"likes",
	"movies",
	"music",
	"books",
	"notes",
	"permissions",
	"photos",
	"albums",
	"videos",
	"events",
	"groups",
	"checkins",
	"locations"
]

fb_data = fbconsole.get("/me")

for connector in connectors:
	try:
		connected_data = fbconsole.get("/me/"+connector)
		fb_data[connector] = connected_data
	except urllib2.HTTPError:
		sys.stderr.write("HTTPError when loading: "+connector+"\n")

fbconsole.logout()

print json.dumps(fb_data, sort_keys=True, indent=4)
