import code
import json

from apiclient.discovery import build
from oauth2client.client import OAuth2WebServerFlow

import httplib2

flow = OAuth2WebServerFlow(client_id='848228885173.apps.googleusercontent.com',
		client_secret='ZxptQrWQZRecPOZKWFb5dfTx',
		scope='https://www.googleapis.com/auth/plus.me')

auth_uri = flow.step1_get_authorize_url(redirect_uri='http://volant.ecs.soton.ac.uk/datahappi/study/aug-2012/g-plus/redirect.html')

code = raw_input("To authorize, go to the below URL and enter the code:\n"+auth_uri+"\n\nCode: ")

credentials = flow.step2_exchange(code)

http = httplib2.Http()
http = credentials.authorize(http)

service = build('plus', 'v1', http=http)

me_document = service.people().get(userId='me').execute()

print json.dumps(me_document)
