
ALL : restaurants.rdf menus.rdf

clean:
	rm restaurants.rdf menus.rdf

menus.rdf:
	cd cuisinenet ; $(MAKE) $(MFLAGS) && cp menus.rdf ..

restaurants.rdf:
	cwm --n3 restaurants.n3 --rdf > restaurants.rdf

