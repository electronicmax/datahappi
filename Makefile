
ALL : _made

_made : js tests examplesjs

js : force_look
	cd tests; $(MAKE) $(MFLAGS)

tests : force_look
	cd tests; $(MAKE) $(MFLAGS)

examplesjs : force_look
	cd examples/js; $(MAKE) $(MFLAGS)

force_look:
	true
