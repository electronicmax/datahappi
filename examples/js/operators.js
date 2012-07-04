define(['js/rdf/RDFCollection','js/ops/chain-engine', 'js/utils'],
       function(rdfc, ce, util) {
           var ItemView = Backbone.View.extend({
               tagName:'div',
               class:'instance',
               template:$('#instance_template').text(),
               initialize:function() {
                   
               },
               render:function() {
                   this.$el.html(_(this.template).template({m:this.options.model.toJSON()}));
                   return this.el;
               }               
           });           
           var V = Backbone.View.extend({
               initialize:function() {
                   
               },
               render:function() {
                   var vals_table = this.$el.find("#values");
                   this.views = this.collection.map(function(x) {
                       var iv = new ItemView({model:x});
                       var row = $("<tr></tr>").appendTo(vals_table);
                       var td = $("<td></td>").appendTo(row);
                       td.append(iv.render());
                       $(
                           util.t("<td><%= props %></td>",
                                  {
                                      props: _(x.attributes).keys().map(function(x) {
                                          return _($("#prop_template").text()).template({p:x});
                                      }).join(',')
                                  })
                       ).appendTo(row);
                       var val = $("<td></td>").appendTo(row);
                       iv.val_view = val;
                       // console.log(td);
                       return iv;
                   });                   
               },
               compute:function() {
                   this.views.map(function(iv) {
                       var model = iv.model;
                       var vals = ce.apply_chain(model,['latitude','longitude']);
                       if (vals && vals.length > 0) {
                           iv.val_view.html(
                               util.t("<%= latitude %>, <%= longitude %>",
                                      vals[0].attributes));
                           
                       }
                   });
               },
               load:function(url) {
                   var this_ = this;
                   var d = util.deferred();
                   this.collection = rdfc.get_rdf(url);
                   this.collection.fetch().then(function() {
                       this_.render();
                       this_.compute();
                       d.resolve();
                   });
                   return d.promise();
               },
           });
           var v = new V({el:$('.main')[0]});
           $('.load').click(function() {
               v.load($('#url').val());               
           });
           $('form').submit(function() {
               console.log('submit!');
               v.load($('#url').val());                              
               return false;
           });
           window.rdf = rdfc;
           window.ce = ce;
           window.view = v;           
           return {};
       });

