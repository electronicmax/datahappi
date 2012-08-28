
ALL : restaurants-tripadvisor.rdf businesses-yelp.rdf menus.rdf

clean:
	rm restaurants-tripadvisor.rdf menus.rdf businesses-yelp.rdf

menus.rdf:
	cd cuisinenet ; $(MAKE) $(MFLAGS) && cp menus.rdf ..

restaurants-tripadvisor.rdf:
	cwm --n3 restaurants-tripadvisor.n3 --rdf > restaurants-tripadvisor.rdf

businesses-yelp.rdf:
	cwm --n3 businesses-yelp.n3 --rdf > businesses-yelp.rdf

