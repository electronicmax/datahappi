define([],
       function() {
           var EQ = function(l1,l2) {
               return l1.length == l2.length && _(l1).difference(l2).length == 0;
           };
           var flatten = function(L) {
               return L.reduce(function(x,y) { return x.concat(y); }, []);
           }           
           var DEFINED = function(x) {  return x !== undefined;    }
           var TRANSFORMERS = [
               {
                   domain:["within"],
                   range: ["lat","lng"],
                   fn: function(x) { return { lat: x.within.lat, lng : x.within.lng }; }
               },
               {
                   domain:["blah"],
                   range: ["within"],
                   fn: function(x) { return { within: { lat: 328, lng : 2398} }; }
               },
               {
                   domain:["goo"],
                   range: ["within"],
                   fn: function(x) { return { within: { lat: 328, lng : 2398} }; }
               },
               {
                   domain:["boo"],
                   range: ["goo"],
                   fn: function(x) { return { within: { lat: 328, lng : 2398} }; }
               },
               {
                   domain:["boo"],
                   range: ["lat","lng"],
                   fn: function(x) { return { within: { lat: 328, lng : 2398} }; }
               }                              
           ];
           
           return {
               find_chain: function(src_type, dest_type, transformers) {
                   var transformers = transformers || TRANSFORMERS;
                   var me = arguments.callee;
                   
                   if (EQ(src_type, dest_type)) { return [[]]; } // goal achieved.

                   // find transforms that will give us our current destination
                   var good_destination = transformers.filter(function(T) {
                       return EQ(T.range, dest_type);
                   });
                   
                   // try to find a path from our src to each candidate's domain
                   return flatten(good_destination.map(function(T) {
                       // find valid paths to T's domain, then add ourselves to it
                       var m = me(src_type, T.domain, transformers); 
                       return m.map(function(trail) {
                           return trail.concat(T); 
                       });
                   }));
               }
           };

           
       });
