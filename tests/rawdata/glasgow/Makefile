
ALL : hygiene.rdf tripadvisor.rdf yelp.rdf facebook.rdf twitter.rdf gplus.rdf hygiene.tsv tripadvisor.tsv yelp.tsv facebook.tsv twitter.tsv gplus.tsv

clean:
	rm hygiene.rdf tripadvisor.rdf yelp.rdf facebook.rdf twitter.rdf gplus.rdf hygiene.tsv tripadvisor.tsv yelp.tsv facebook.tsv twitter.tsv gplus.tsv

hygiene.rdf:
	cwm --n3 hygiene.n3 --rdf > hygiene.rdf

tripadvisor.rdf:
	cwm --n3 tripadvisor.n3 --rdf > tripadvisor.rdf

yelp.rdf:
	cwm --n3 yelp.n3 --rdf > yelp.rdf

facebook.rdf:
	cwm --n3 facebook.n3 --rdf > facebook.rdf

twitter.rdf:
	cwm --n3 twitter.n3 --rdf > twitter.rdf

gplus.rdf:
	cwm --n3 gplus.n3 --rdf > gplus.rdf

hygiene.tsv:
	python ../rdf2tsv.py hygiene.n3 > hygiene.tsv

tripadvisor.tsv:
	python ../rdf2tsv.py tripadvisor.n3 > tripadvisor.tsv

yelp.tsv:
	python ../rdf2tsv.py yelp.n3 > yelp.tsv

facebook.tsv:
	python ../rdf2tsv.py facebook.n3 > facebook.tsv

twitter.tsv:
	python ../rdf2tsv.py twitter.n3 > twitter.tsv

gplus.tsv:
	python ../rdf2tsv.py gplus.n3 > gplus.tsv



