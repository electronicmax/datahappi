"""
	This script, when run, should ask you to authenticate within a browser then
	spit out all your FB stuff in JSON format. It'll be quite big so you'll
	probably want to redirect stdout to a file.

	Requires fbconsole, which requires a couple more things, all of which I
	managed to install with pip.
"""

from cStringIO import StringIO
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
	"email",
	"read_friendlists",
	"read_insights",
	"read_mailbox",
	"read_requests",
	"read_stream",
	"xmpp_login",
	"ads_management",
	"create_event",
	"manage_friendlists",
	"manage_notifications",
	"user_online_presence",
	"friends_online_presence",
	"publish_checkins",
	"publish_stream",
	"rsvp_event",
	"publish_actions",
	"user_actions.music",
	"user_actions.news",
	"user_actions.video",
	"user_games_activity"
]

sys.stdout = mystdout = StringIO()
fbconsole.authenticate()
sys.stdout = sys.__stdout__

sys.stderr.write(mystdout.getvalue())

connectors = [
	"accounts",
	"activities",
	"adaccounts",
	"albums",
	"apprequests",
	"books",
	"checkins",
	"events",
	"family",
	"feed",
	"friendlists",
	"friendrequests",
	"friends",
	"games",
	"groups",
	"home",
	"inbox",
	"interests",
	"likes",
	"links",
	"locations",
	"messagingfavorites",
	"movies",
	"music",
	"mutualfriends",
	"notes",
	"notifications",
	"outbox",
	"payments",
	"permissions",
	"photos",
	"picture",
	"posts",
	"scores",
	"statuses",
	"tagged",
	"television",
	"updates",
	"videos"
]

fb_data = fbconsole.get("/me")

for connector in connectors:
	sys.stderr.write("Loading: "+connector+"\t")
	try:
		connected_data = fbconsole.get("/me/"+connector)
		fb_data[connector] = connected_data
		sys.stderr.write("success\n")
	except urllib2.HTTPError:
		sys.stderr.write("HTTPError: Maybe permissions\n")
	except ValueError:
		sys.stderr.write("ValueError: Probably not decodable to JSON\n")

fbconsole.logout()

print json.dumps(fb_data, sort_keys=True, indent=4)
