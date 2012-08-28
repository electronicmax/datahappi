
ALL : weather.rdf

clean:
	rm weather.n3 weather.rdf

weather.rdf:
	python weather.py > weather.n3 && cwm --n3 weather.n3 --rdf > weather.rdf

