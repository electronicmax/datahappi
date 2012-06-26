define([],
       function() {
           window.dse = {
               fetch_by_proxy:function(url,proxy_url) {
                   proxy_url = proxy_url || "http://"+ document.location.host + ":9292";
                   return $.get(proxy_url, { url : url });
               },
           };
           return dse;
       });
