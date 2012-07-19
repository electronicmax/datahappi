
ALL = _made

_made	: ui *.js
	jshint --show-non-errors *.js
	touch ._made

ui:	force_look
	cd ui; $(MAKE) $(MFLAGS)

force_look:
	true
