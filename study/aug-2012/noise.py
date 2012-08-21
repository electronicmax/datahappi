import json
import pycurl
import StringIO

import pdb

curl = pycurl.Curl()
buff = StringIO.StringIO()

curl.setopt(pycurl.URL, "http://api.twitter.com/1/statuses/public_timeline.json")
curl.setopt(pycurl.WRITEFUNCTION, buff.write)
curl.perform()

def geocode(location):
	curl = pycurl.Curl()
	buff = StringIO.StringIO()

	url = ("http://maps.googleapis.com/maps/api/geocode/json?address="+location+"&sensor=false").encode('utf8')
	curl.setopt(pycurl.URL, url)
	curl.setopt(pycurl.WRITEFUNCTION, buff.write)
	curl.perform()

	results = json.loads(buff.getvalue())
	pdb.set_trace()
	if results['status'] == "ZERO_RESULTS":
		return ""
	else:
		return results['formatted_address']

locations = map(
	lambda status: (status['user']['location'],
					geocode(status['user']['location'])),
	json.loads(buff.getvalue()))

for location in locations:
	print location[0]+"\t"+location[1]
