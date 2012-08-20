import code
import json
from pprint import pprint

from apiclient.discovery import build
from oauth2client.client import OAuth2WebServerFlow

import httplib2

flow = OAuth2WebServerFlow(client_id='848228885173.apps.googleusercontent.com',
		client_secret='ZxptQrWQZRecPOZKWFb5dfTx',
		scope=['https://www.googleapis.com/auth/userinfo.email',
				'https://www.googleapis.com/auth/plus.me')

auth_uri = flow.step1_get_authorize_url(redirect_uri='http://volant.ecs.soton.ac.uk/datahappi/study/aug-2012/g-plus/redirect.html')

code = raw_input("To authorize, go to the below URL and enter the code:\n"+auth_uri+"\n\nCode: ")

credentials = flow.step2_exchange(code)

http = httplib2.Http()
http = credentials.authorize(http)

service = build('plus', 'v1', http=http)
me_document = service.people().get(userId='me').execute()
me_document['activities'] = service.activities().list(
								userId='me',
								collection='public'
							).execute()
for activity in me_document['activities']['items']:
	activity['comments'] = service.comments().list(activityId=activity['id']).execute()

with open('plus_json', 'w') as FILE:
	FILE.write(json.dumps(me_document, sort_keys=True, indent=4))
print "written output to file 'plus_json'"
