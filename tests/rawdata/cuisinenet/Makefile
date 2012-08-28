
ALL : menus.rdf

clean:
	rm menus.n3 menus.rdf

menus.rdf:
	python menu_parse.py > menus.n3 && cwm --n3 menus.n3 --rdf > menus.rdf

