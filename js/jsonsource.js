define([],
	   function() {
		   var JSONSource = Source.extend({
			   fetch:function() {
				   var this_ = this;
				   var d = util.deferred();
			   }		
		   });

		   return { JSONSource : JSONSource };		   
	   });
	   
