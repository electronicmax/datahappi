
ALL = _made

_made	: ops ui *.js
	jshint --show-non-errors *.js
	touch ._made

ui:	force_look
	cd ui; $(MAKE) $(MFLAGS)

ops: force_look
	cd ops; $(MAKE) $(MFLAGS)

rdf: force_look
	cd rdf; $(MAKE) $(MFLAGS)

force_look:
	true
