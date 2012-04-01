/**
 * Backbone localStorage Adapter
 * https://github.com/jeromegn/Backbone.localStorage
 */
(function(){function a(){return((1+Math.random())*65536|0).toString(16).substring(1)}function b(){return a()+a()+"-"+a()+"-"+a()+"-"+a()+"-"+a()+a()+a()}Backbone.LocalStorage=window.Store=function(a){this.name=a;var b=this.localStorage().getItem(this.name);this.records=b&&b.split(",")||[]},_.extend(Backbone.LocalStorage.prototype,{save:function(){this.localStorage().setItem(this.name,this.records.join(","))},create:function(a){return a.id||(a.id=a.attributes[a.idAttribute]=b()),this.localStorage().setItem(this.name+"-"+a.id,JSON.stringify(a)),this.records.push(a.id.toString()),this.save(),a},update:function(a){return this.localStorage().setItem(this.name+"-"+a.id,JSON.stringify(a)),_.include(this.records,a.id.toString())||this.records.push(a.id.toString()),this.save(),a},find:function(a){return JSON.parse(this.localStorage().getItem(this.name+"-"+a.id))},findAll:function(){return _(this.records).chain().map(function(a){return JSON.parse(this.localStorage().getItem(this.name+"-"+a))},this).compact().value()},destroy:function(a){return this.localStorage().removeItem(this.name+"-"+a.id),this.records=_.reject(this.records,function(b){return b==a.id.toString()}),this.save(),a},localStorage:function(){return localStorage}}),Backbone.LocalStorage.sync=window.Store.sync=Backbone.localSync=function(a,b,c,d){var e=b.localStorage||b.collection.localStorage;typeof c=="function"&&(c={success:c,error:d});var f;switch(a){case"read":f=b.id!=undefined?e.find(b):e.findAll();break;case"create":f=e.create(b);break;case"update":f=e.update(b);break;case"delete":f=e.destroy(b)}f?c.success(f):c.error("Record not found")},Backbone.ajaxSync=Backbone.sync,Backbone.getSyncMethod=function(a){return a.localStorage||a.collection&&a.collection.localStorage?Backbone.localSync:Backbone.ajaxSync},Backbone.sync=function(a,b,c,d){Backbone.getSyncMethod(b).apply(this,[a,b,c,d])}})();