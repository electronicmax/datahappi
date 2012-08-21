# https://graph.facebook.com/USERID

# Connections
# facebook = set([ "accounts", "activities", "adaccounts", "albums", "apprequests", "books", "checkins", "events", "family", "feed", "friendlists", "friendrequests", "friends", "games", "groups", "home", "inbox", "interests", "likes", "links", "locations", "messagingfavorites", "movies", "music", "mutualfriends", "notes", "notifications", "outbox", "payments", "permissions", "photos", "picture", "posts", "scores", "statuses", "tagged", "television", "updates", "videos":"id", "name", "first_name", "middle_name", "last_name", "gender", "locale", "languages", "link", "username", "third_party_id", "installed", "timezone", "updated_time", "verified", "bio", "birthday", "cover", "currency", "devices", "education", "email", "hometown", "interested_in", "location", "political", "favorite_athletes", "favorite_teams", "picture", "quotes", "relationship_status", "religion", "security_settings", "significant_other", "video_upload_limits", "website", "work", ])

# No connections
facebook = {
	"id":"string",
	"name":"string",
	"first_name":"string",
	"middle_name":"string",
	"last_name":"string",
	"gender":"string",
	"locale":"string",
	"languages":[{
		"id":"string",
		"name":"string"
	}],
	"link":"string",
	"username":"string",
	"third_party_id":"string",
	"installed":"optional. always returns true if present",
	"timezone":"number. Offset from UTC",
	"updated_time":"string containing ISO-8601 datetime",
	"verified":"bool",
	"bio":"string",
	"birthday":"string in mm/dd/yy",
	"cover":[{
		"id":"string",
		"source":"string",
		"offset_y":"string"
	}],
	"currency":{
		"currency":{
			"user_currency":"string. IDO-4217-3 code",
			"currency_exchange":"number. exchange rate for fb credits",
			"currency_exchange_inverse":"number. 1/currency_exchange",
			"currency_offset":"number"},
		"id":"string"},
	"devices":[{
		"os":"string. 'iOS' or 'Android'",
		"hardware":"'iPad' or 'iPhone'. optional"
	}],
	"education":[{
		"year":None,
		"type":"string",
		"school":{
			"name":"string",
			"id":"string",
			"type":"string",
			"year":"optional",
			"degree":"optional",
			"concentration":[],
			"classes":[],
			"with":[]
		}
	}],
	"email":"string. valid RFC822 email address",
	"hometown":{
		"name":"string",
		"id":"string"
	},
	"interested_in":["string"],
	"location":{
		"name":"string",
		"id":"string"
	},
	"political":"string",
	"favorite_athletes":[{
		"id":"string",
		"name":"string"
	}],
	"favorite_teams":[{
		"id":"string",
		"name":"string"
	}],
	"picture":"string",
	"quotes":"string",
	"relationship_status":"string. One of `Single`, `In a relationship`, `Engaged`, `Married`, `It's complicated`, `In an open relationship`, `Widowed`, `Separated`, `Divorced`, `In a civil union`, `In a domestic partnership`",
	"religion":"string",
	"security_settings":{
		"secure_browsing":{
			"enabled":"bool"
		}
	},
	"significant_other":[{
		"id":"string",
		"name":"string"
	}],
	"video_upload_limits":[{
		"length":None,
		"size":None
	}],
	"website":"string. valid url",
	"work":[{
		"employer":None,
		"location":None,
		"position":None,
		"start_date":None,
		"end_date":None
	}]
}

plus = {
	"kind": "plus#person",
	"etag": "etag",
	"objectType": "string",
	"id": "string",
	"displayName": "string",
	"name": {
		"formatted": "string",
		"familyName": "string",
		"givenName": "string",
		"middleName": "string",
		"honorificPrefix": "string",
		"honorificSuffix": "string"
	},
	"nickname": "string",
	"tagline": "string",
	"birthday": "string",
	"gender": "string",
	"aboutMe": "string",
	"currentLocation": "string",
	"relationshipStatus": "string",
	"url": "string",
	"image": {
		"url": "string"
	},
	"emails": [
		{
			"value": "string",
			"type": "string",
			"primary": "boolean"
		}
	],
	"urls": [
		{
			"value": "string",
			"type": "string",
			"primary": "boolean"
		}
	],
	"organizations": [
		{
			"name": "string",
			"department": "string",
			"title": "string",
			"type": "string",
			"startDate": "string",
			"endDate": "string",
			"location": "string",
			"description": "string",
			"primary": "boolean"
		}
	],
	"placesLived": [
		{
			"value": "string",
			"primary": "boolean"
		}
	],
	"languagesSpoken": [
		"string"
	],
	"hasApp": "boolean"
}

twitter = {
	"id":"number",
	"id_str":"string",
	"name":"string",
	"screen_name":"string",
	"location":"string",
	"url":"string",
	"description":"string",
	"protected":"bool",
	"followers_count":"number",
	"friends_count":"number",
	"listed_count":"number",
	"created_at":"date",
	"favourites_count":"number",
	"utc_offset":"number",
	"time_zone":"string",
	"geo_enabled":"bool",
	"verified":"bool",
	"statuses_count":"number",
	"lang":"string",
	"status":{
		"created_at":"string",
		"id":"number",
		"id_str":"string",
		"text":"string",
		"source":"string",
		"truncated":"bool",
		"in_reply_to_status_id":"string",
		"in_reply_to_status_id_str":"string",
		"in_reply_to_user_id":"number",
		"in_reply_to_user_id_str":"string",
		"in_reply_to_screen_name":"string",
		"geo":"depreciated",
		"coordinates":{
			"coordinates":["number", "number"],
			"type":"string. always 'Point'"
		},
		"place":{
			"attributes":{},
			"bounding_box":{
				"coordinates":["number", "number"],
				"type":"string. always 'Point'"
			},
			"country":"string",
			"country_code":"string",
			"full_name":"String",
			"id":"string",
			"name":"string",
			"place_type":"string",
			"url":"string"
		},
		"contributors":[{
			"id":"number",
			"id_str":"string",
			"screen_name":"string"
		}],
		"retweet_count":"number",
		"entities":{
			"hashtags":[],
			"urls":[{
				"url":"string",
				"expanded_url":"string",
				"display_url":"string",
				"indices":[]
			}],
			"user_mentions":[]
		},
		"favorited":"bool",
		"retweeted":"bool",
		"possibly_sensitive":"bool"
	},
	"contributors_enabled":"bool",
	"is_translator":"bool",
	"profile_background_color":"string",
	"profile_background_image_url":"string",
	"profile_background_image_url_https":"string",
	"profile_background_tile":"bool",
	"profile_image_url":"string",
	"profile_image_url_https":"string",
	"profile_link_color":"string",
	"profile_sidebar_border_color":"string",
	"profile_sidebar_fill_color":"string",
	"profile_text_color":"string",
	"profile_use_background_image":"bool",
	"show_all_inline_media":"bool",
	"default_profile":"bool",
	"default_profile_image":"bool",
	"following":"bool. depreciated; incorrect information",
	"follow_request_sent":"bool",
	"notifications":"depreciated. incorrect"
}


