
ALL : ucas.rdf ucas.tsv compguide.rdf compguide.tsv the.rdf the.tsv unistats.rdf unistats.tsv

clean:
	rm ucas.rdf ucas.tsv compguide.rdf compguide.tsv the.rdf the.tsv unistats.rdf unistats.tsv

ucas.rdf:
	cwm --n3 ucas.n3 --rdf > ucas.rdf

ucas.tsv:
	python ../rdf2tsv.py ucas.n3 > ucas.tsv

compguide.rdf:
	cwm --n3 compguide.n3 --rdf > compguide.rdf

compguide.tsv:
	python ../rdf2tsv.py compguide.n3 > compguide.tsv

the.rdf:
	cwm --n3 the.n3 --rdf > the.rdf

the.tsv:
	python ../rdf2tsv.py the.n3 > the.tsv

unistats.rdf:
	cwm --n3 unistats.n3 --rdf > unistats.rdf

unistats.tsv:
	python ../rdf2tsv.py unistats.n3 > unistats.tsv



