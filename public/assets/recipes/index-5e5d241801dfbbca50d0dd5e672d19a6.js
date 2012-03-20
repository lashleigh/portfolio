function isNum(a){return!!a&&parseFloat(a)===a*1}var App={Collections:{},Views:{},Models:{}};as_percent=function(a){return Math.round(1e4*a)/100},truncate=function(a){return Math.round(100*a)/100},App.Models.Recipe=Backbone.Model.extend({initialize:function(){this.parts=new App.Collections.PartList,this.notes=new App.Collections.NoteList,this.view=new App.Views.Recipe({model:this,id:"recipe_"+this.id}),$("#recipe_container").append(this.view.render().el),this.parts.url="/recipes/"+this.id+"/parts",this.parts.recipeView=this.view,this.parts.reset(this.get("parts")),this.parts.bind("all",this.view.update_stats,this.view),this.notes.url="/recipes/"+this.id+"/notes",this.notes.recipeView=this.view,this.notes.reset(this.get("notes")),this.view.update_stats()}}),App.Views.Recipe=Backbone.View.extend({tagName:"div",className:"recipe",events:{"click .add":"newPart","click .hydration":"editHydration","blur .edit-hydration":"exitEditHydration","keypress .edit-hydration":"updateHydrationOnEnter","keyup input#new-amount":"updateNewPercent","keyup input#new-percent":"updateNewAmount","blur .innoculation":"updateInnoculation"},updateInnoculation:function(){var a=$(".innoculation").text();isNum(a)?console.log("new innoculation",a):$(".innoculation").text(this.model.parts.stats().innoculation)},editHydration:function(){$(this.el).addClass("editing-hydration"),$(this.el).find(".edit-hydration").removeClass("hidden").focus()},exitEditHydration:function(){$(this.el).removeClass("editing-hydration"),$(this.el).find(".edit-hydration").addClass("hidden")},updateHydrationOnEnter:function(a){if(a.keyCode==13){var b=this.model.parts.filter(function(a){return a.get("ingredient").name==="water"})[0],c=this.hydration_input.val(),d=this.model.parts.water_mass(),e=this.model.parts.flour_mass(),f=(d-b.get("amount"))/e*100;if(f<c){var g=(c-f)/100*e,h=as_percent(g/e);b.save({amount:g,percent:h})}this.exitEditHydration(),this.update_stats()}},updateNewPercent:function(){var a=as_percent(this.new_amount.val()/this.model.parts.flour_mass());this.new_percent.val(""),this.new_percent.attr("placeholder",a)},updateNewAmount:function(){var a=truncate(this.new_percent.val()/100*this.model.parts.flour_mass());this.new_amount.val(""),this.new_amount.attr("placeholder",a)},update_stats:function(){var a=_.template($("#recipe-stats").html());$(this.el).find(".stats").html(a(this.model.parts.stats())),this.hydration_input=$(this.el).find(".edit-hydration")},newPart:function(){var a=this.new_amount.val(),b=this.new_percent.val(),c=this.new_name.val(),d=this.new_name_id.val(),e=!1;if(!c)return;if(isNum(b))a=truncate(b/100*this.model.parts.flour_mass()),e=!0;else if(isNum(a))b=as_percent(a/this.model.parts.flour_mass());else return;var f=this.model.parts.create({percent:b,amount:a,ingredient_id:d,fixed_percent:e,ingredient:{name:c}});!f||$(this.el).find("#new-part").find("input").val("")},render:function(){var a=_.template($("#recipe-li").html());return $(this.el).html(a(this.model.toJSON())),this.new_amount=$(this.el).find("#new-amount"),this.new_percent=$(this.el).find("#new-percent"),this.new_name=$(this.el).find("#new-name"),this.new_name_id=$(this.el).find("#new-name-id"),this}}),App.Views.Note=Backbone.View.extend({tagName:"div",className:"note",initialize:function(){this.template=$("#note-li").html(),$("#new-note").after(this.render().el),this.model.bind("change",this.render,this)},events:{"click .body":"editBody","click .body-cancel":"exitEditBody","click .body-submit":"updateBody","click .remove":"destroy"},destroy:function(){this.model.destroy(),$(this.el).remove()},editBody:function(){this.note_body.addClass("hidden"),this.edit_body.removeClass("hidden"),this.body_input.focus()},exitEditBody:function(){this.note_body.removeClass("hidden"),this.edit_body.addClass("hidden")},updateBody:function(){this.model.save({body:this.body_input.val()}),this.exitEditBody()},localTime:function(){var a=new Date(this.model.get("time")),b=a.getHours(),c=a.getMinutes();c<10&&(c="0"+c);var d=" am";b>=12&&(d=" pm",b=b-12?b-12:12);var e=b+":"+c+d,f=new Date,g=(f-a)/864e5,h;return g<1?h="today":g<2?h="yesterday":h=Math.floor(g)+" days ago",h+" at "+e},render:function(){var a=_.template(this.template);return $(this.el).html(a(this.model.toJSON())),$(this.el).find(".time").text(this.localTime()),this.note_body=$(this.el).find(".body"),this.body_input=$(this.el).find(".body-input"),this.edit_body=$(this.el).find(".edit-body"),this}}),App.Views.Part=Backbone.View.extend({tagName:"tr",className:"part",initialize:function(){this.template=this.model.get("primary")?$("#primary-part-li").html():$("#part-li").html(),$(this.model.collection.recipeView.el).find("#part-list").append(this.render().el),this.model.bind("change",this.render,this),this.model.bind("destroy",this.remove,this)},events:{"click .amount":"editAmount","click .percent":"editPercent","click .name":"editName","click .remove":"clear","click .fixed-percent-input":"toggleFixedPercent","keypress .edit-amount":"updateAmountOnEnter","keypress .edit-name":"updateIngredientOnEnter","keypress .edit-percent":"updatePercentOnEnter"},toggleFixedPercent:function(){this.model.save({fixed_percent:!this.model.get("fixed_percent")})},editAmount:function(a){this.resetFields("editing-amount"),this.input_amount.removeClass("hidden").focus()},editPercent:function(){this.resetFields("editing-percent"),this.input_percent.removeClass("hidden").focus()},editName:function(){this.resetFields("editing-name"),this.input_name.removeClass("hidden").focus()},resetFields:function(a){$(this.el).addClass(a),this.input_name.val(this.model.get("ingredient").name),this.input_amount.val(this.model.get("amount")),this.input_percent.val(this.model.get("percent"))},updatePercentOnEnter:function(a){if(a.keyCode==13){var b=truncate(this.input_percent.val()),c=truncate(b/100*this.model.collection.flour_mass());this.model.save({amount:c,percent:b}),this.exitEditing()}},updateAmountOnEnter:function(a){if(a.keyCode==13){var b=this.input_amount.val(),c=as_percent(b/this.model.collection.flour_mass());this.model.save({amount:b,percent:c}),this.exitEditing()}},updateIngredientOnEnter:function(a){a.keyCode==13&&this.saveIngredient()},saveIngredient:function(){this.model.save({ingredient_id:this.input_name_id.val(),ingredient:{name:this.input_name.val()}}),this.exitEditing()},exitEditing:function(){this.input_amount.addClass("hidden"),this.input_name.addClass("hidden"),this.input_percent.addClass("hidden"),$(this.el).removeClass("editing-amount editing-name editing-percent")},remove:function(){$(this.el).remove()},clear:function(){this.model.destroy()},autocomplete:function(){var a=this;return{minLength:0,source:ingredients,focus:function(b,c){return a.input_name.val(c.item.label),!1},select:function(b,c){return a.input_name.val(c.item.label),a.input_name_id.val(c.item.value),a.saveIngredient(),!1}}},truncate:function(a){return a.amount=truncate(a.amount),a.percent=truncate(a.percent),a},render:function(){var a=_.template(this.template);$(this.el).html(a(this.model.toJSON())),this.input_amount=$(this.el).find(".edit-amount"),this.input_percent=$(this.el).find(".edit-percent"),this.input_name=$(this.el).find(".edit-name"),this.input_name_id=$(this.el).find(".edit-name-id");var b=this.model.attributes;return this.input_amount.bind("blur",_.bind(this.exitEditing,this)).val(b.amount),this.input_percent.bind("blur",_.bind(this.exitEditing,this)).val(b.percent),this.input_name.bind("blur",_.bind(this.exitEditing,this)).val(b.ingredient.name).autocomplete(this.autocomplete()),this.model.get("primary")||(this.el.getElementsByClassName("fixed-percent-input")[0].checked=this.model.get("fixed_percent")),this}}),App.Models.Part=Backbone.Model.extend({validate:function(a){var b=[];return _.isUndefined(a.amount)||(a.amount.length===0?b.push("amount is empty "):a.amount/a.amount!==1&&b.push("amount is not a number")),!!_.isUndefined(a.ingredient_id),_.isUndefined(a.ingredient)||a.ingredient.name.length<3&&b.push("ingredient name is too short"),_.any(b)?b:!1},initialize:function(){if(!this.validate(this.attributes)){var a=this.id?this.id:this.cid;this.view=new App.Views.Part({model:this,id:"part_"+a})}(this.get("ingredient").name==="flour"||this.get("ingredient").name==="starter")&&this.bind("change",this.updatePercents,this)},updatePercents:function(){var a=this.collection.flour_mass(),b=this.collection.filter(function(a){return a!==this&&a.get("primary")===!1});_.each(b,function(b){b.get("fixed_percent")?b.save({amount:truncate(b.get("percent")/100*a)}):b.save({percent:as_percent(b.get("amount")/a)})})}}),App.Collections.PartList=Backbone.Collection.extend({model:App.Models.Part,getTotalMass:function(a){return _.pluck(_.pluck(this.filter(function(b){return b.get("ingredient").name==a}),"attributes"),"amount").reduce(function(a,b){return parseFloat(a)+parseFloat(b)},0)},stats:function(){var a=this.getTotalMass("starter")/2,b=this.getTotalMass("water"),c=this.getTotalMass("flour"),d=a/(c+a);return{hydration:as_percent((b+a)/(c+a)),innoculation:as_percent(d),doubling:truncate(-3*Math.log(d)/Math.log(2)),temp:72}},flour_mass:function(){return this.getTotalMass("flour")+this.getTotalMass("starter")/2},water_mass:function(){return this.getTotalMass("water")+this.getTotalMass("starter")/2},initialize:function(){}}),App.Models.Note=Backbone.Model.extend({initialize:function(){this.view=new App.Views.Note({model:this,id:"note_"+this.id})}}),App.Collections.NoteList=Backbone.Collection.extend({model:App.Models.Note,initialize:function(){},newNote:function(){var a=$(".new-note-body").val();if(!a)return;var b=this.create({time:(new Date).toUTCString(),body:$(".new-note-body").val()});$(".new-note-body").val("")}}),App.Collections.Recipes=Backbone.Collection.extend({model:App.Models.Recipe,url:"/recipes"})