define([],
	   function() {
			return {
				'cambridge': [
					{path:['tests','rawdata','cambridge','facebook.rdf'].join('/'),name:"Facebook"},
					{path:['tests','rawdata','cambridge','twitter.rdf'].join('/'), name:"Twitter"},
					{path:['tests','rawdata','cambridge','gplus.rdf'].join('/'), name:"Google+ Friends"},
					{path:['tests','rawdata','cambridge','tripadvisor.rdf'].join('/'), name:"Tripadvisor Restaurants"},
					{path:['tests','rawdata','cambridge','yelp.rdf'].join('/'), name:"Yelp Business Listing"},
					{path:['tests','rawdata','cambridge','hygiene.rdf'].join('/'), name:"Hygiene Ratings"}
				],
				'glasgow': [
					{path:['tests','rawdata','glasgow','facebook.rdf'].join('/'),name:"Facebook"},
					{path:['tests','rawdata','glasgow','twitter.rdf'].join('/'), name:"Twitter"},
					{path:['tests','rawdata','glasgow','gplus.rdf'].join('/'), name:"Google+ Friends"},
					{path:['tests','rawdata','glasgow','tripadvisor.rdf'].join('/'), name:"Tripadvisor Restaurants"},
					{path:['tests','rawdata','glasgow','yelp.rdf'].join('/'), name:"Yelp Business Listing"},
					{path:['tests','rawdata','glasgow','hygiene.rdf'].join('/'), name:"Hygiene Ratings"}
				],
				'test':[
					{path:['tests','peeps.rdf'].join('/'), name:"peeples"}
				]				
			};
	   });
