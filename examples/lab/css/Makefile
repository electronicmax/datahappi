
all: lab.css box.css visual.css 

lab.css : lab.less force_look
	lessc lab.less > lab.css

box.css : box.less force_look 
	lessc box.less > box.css	

visual.css : visual.less force_look
	lessc visual.less > visual.css

force_look:
	true
