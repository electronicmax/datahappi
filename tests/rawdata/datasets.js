define([],
	   function() {
			return {
				'cambridge': [
					{path:['tests','rawdata','cambridge','facebook.rdf'].join('/'),name:"Facebook"},
					{path:['tests','rawdata','cambridge','gplus.rdf'].join('/'), name:"Google+ Friends"},
					{path:['tests','rawdata','cambridge','tripadvisor.rdf'].join('/'), name:"Tripadvisor Restaurants"},
					{path:['tests','rawdata','cambridge','yelp.rdf'].join('/'), name:"Yelp Business Listing"},
					{path:['tests','rawdata','cambridge','hygiene.rdf'].join('/'), name:"Hygiene Ratings"}
				],
				'glasgow': [
					{path:['tests','rawdata','glasgow','facebook.rdf'].join('/'),name:"Facebook"},
					{path:['tests','rawdata','glasgow','gplus.rdf'].join('/'), name:"Google+ Friends"},
					{path:['tests','rawdata','glasgow','tripadvisor.rdf'].join('/'), name:"Tripadvisor Restaurants"},
					{path:['tests','rawdata','glasgow','yelp.rdf'].join('/'), name:"Yelp Business Listing"},
					{path:['tests','rawdata','glasgow','hygiene.rdf'].join('/'), name:"Hygiene Ratings"}
				],
				'uni-history':[
					{path:['tests','rawdata','uni-history','compguide.rdf'].join('/'),name:"Complete Guide to Universities"},
					{path:['tests','rawdata','uni-history','the.rdf'].join('/'),name:"Times Higher Education"},
					{path:['tests','rawdata','uni-history','ucas.rdf'].join('/'),name:"UCAS"},
					{path:['tests','rawdata','uni-history','unistats.rdf'].join('/'),name:"Unistats"}
				],
				'uni-sportsscience':[
					{path:['tests','rawdata','uni-sportsscience','compguide.rdf'].join('/'),name:"Complete Guide to Universities"},
					{path:['tests','rawdata','uni-sportsscience','the.rdf'].join('/'),name:"Times Higher Education"},
					{path:['tests','rawdata','uni-sportsscience','ucas.rdf'].join('/'),name:"UCAS"},
					{path:['tests','rawdata','uni-sportsscience','unistats.rdf'].join('/'),name:"Unistats"}
				],				
				'test':[
					{path:['tests','peeps.rdf'].join('/'), name:"peeples"}
				],
				'test':[
					{path:['tests','peeps.rdf'].join('/'), name:"peeples"},
					{path:['tests','rawdata', 'menus.rdf'].join('/'), name:"menus"},
					// {path:['tests','rawdata', 'twitter.rdf'].join('/'), name:"twitter"}
				]
			};
	   });
