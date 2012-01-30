var App = {
  Collections: {},
  Views: {},
  Models: {}
}
as_percent = function(num) {
  return Math.floor(1000*num) / 10;
}
truncate = function(num) {
  return Math.floor(10*num) / 10;
}

App.Models.Recipe = Backbone.Model.extend({
  initialize: function() {
    this.parts = new App.Collections.PartList
    this.view = new App.Views.Recipe({model: this, id: 'recipe_'+this.id});
    $("#recipe_container").append(this.view.render().el);
    
    this.parts.url = '/recipes/'+this.id+'/parts';
    this.parts.recipeView = this.view;
    this.parts.reset(this.get('parts'));

    this.parts.bind('all', this.view.update_stats, this.view)
    this.view.update_stats();
  }
})
App.Collections.Recipes = Backbone.Collection.extend({
  model: App.Models.Recipe,
  url: '/recipes',
})

App.Views.Recipe = Backbone.View.extend({
  tagName: 'div',
  className: 'recipe',
  events: {
    'click .add'    : 'newPart',
  },
  update_stats: function() {
    var template = _.template($('#recipe-stats').html());
    $(this.el).find('.stats').html(template(this.model.parts.stats()));
    console.log('update stats');
  },
  newPart: function() {
    var amount = this.new_amount.val();
    var name = this.new_name.val();
    var id = this.new_name_id.val();
    var unit = $(this.el).find('.new-unit').val();
    if(!amount || !name) return;
    var newIng = this.model.parts.create({
      percent: Math.floor(1000* amount / this.model.parts.flour_mass())/10,
      amount: amount,
      unit: unit,
      ingredient_id: id,
      ingredient: {
        name: name
      }
    })
    if(!!newIng) {
      this.new_amount.val('');
      this.new_name.val('');
      this.new_name_id.val('');
    }
  },
  render: function() {
    var template = _.template($('#recipe-li').html());
    $(this.el).html(template(this.model.toJSON()))
    this.new_amount = $(this.el).find('.new-amount');
    this.new_name   = $(this.el).find('#new-name');
    this.new_name_id= $(this.el).find('#new-name-id');
    return this;
  }
});
App.Views.Part = Backbone.View.extend({
  tagName: 'tr',
  className: 'parts',
  initialize: function() {
    this.template = this.model.get('primary') ? $('#primary-part-li').html() : $('#part-li').html();
    $(this.model.collection.recipeView.el).find('#part-list').append(this.render().el)
    this.model.bind('change', this.render, this);
    this.model.bind('destroy', this.remove, this);
  },
  events: {
    'click .amount' : 'editAmount',
    'click .name'   : 'editName',
    'click .unit'   : 'editUnit',
    'click .remove': 'clear',
    "keypress .edit-amount"      : "updateAmountOnEnter",
    "keypress .edit-name"      : "updateIngredientOnEnter",
  },
  editAmount: function() {
    $(this.el).addClass('editing-amount');
    this.input_name.val(this.model.get('ingredient').name);
    this.input_amount.removeClass('hidden').focus();
  },
  editName: function() {
    $(this.el).addClass('editing-name'); 
    this.input_amount.val(this.model.get('amount'));
    this.input_name.removeClass('hidden').focus();
  },
  editUnit: function() {
    $(this.el).addClass('editing-unit');
    this.input_name.val(this.model.get('ingredient').name);
    this.input_amount.val(this.model.get('amount'));
    this.select_unit.removeClass('hidden').val(this.model.get('unit')).focus();
  },
  updateAmountOnEnter: function(e) {
    if(e.keyCode == 13) {
      var amount = this.input_amount.val();
      var percent = Math.floor(1000*amount / this.model.collection.flour_mass())/10;
      this.model.save({amount: amount, percent: percent});
      this.exitEditing();
    }
  },
  updateIngredientOnEnter: function(e) {
    if(e.keyCode == 13) {
      this.saveIngredient();
    }
  },
  saveIngredient: function() {
    this.model.save({
      ingredient_id: this.input_name_id.val(), 
      ingredient: {
        name: this.input_name.val()
      }
    })
    this.exitEditing();
  },
  updateUnit: function() {
    this.model.save({unit: this.select_unit.val()});
    this.exitEditing();
  },
  exitEditing: function() {
    this.input_amount.addClass('hidden');
    this.input_name.addClass('hidden');
    this.select_unit.addClass('hidden');
    $(this.el).removeClass("editing-amount editing-name editing-unit");
  },
  remove: function() {
    $(this.el).remove();
  },
  clear: function() {
    this.model.destroy();
  },
  autocomplete: function() {
    var part = this;
    return {
      minLength: 0,
      source: ingredients,
      focus: function( event, ui ) {
        part.input_name.val( ui.item.label );
        return false;
      },
      select: function( event, ui ) {
        part.input_name.val( ui.item.label );
        part.input_name_id.val( ui.item.value );
        part.saveIngredient();
        return false;
      }
    }
  },
  render: function() {
    //this.model.set({'percent': Math.floor(1000*this.model.get('amount') / this.model.collection.flour_mass())/10});
    var template = _.template(this.template);
    $(this.el).html(template(this.model.toJSON()));
    
    this.input_amount = $(this.el).find('.edit-amount'); 
    this.input_name = $(this.el).find('.edit-name');
    this.input_name_id=$(this.el).find('.edit-name-id');
    this.select_unit = $(this.el).find('.edit-unit');
    
    var attrs = this.model.attributes;
    this.input_amount.bind('blur', _.bind(this.exitEditing, this)).val(attrs.amount);
    this.input_name.bind('blur', _.bind(this.exitEditing, this)).val(attrs.ingredient.name).autocomplete(this.autocomplete());
    this.select_unit.bind('blur', _.bind(this.exitEditing, this)).val(attrs.unit);
    this.select_unit.bind('change', _.bind(this.updateUnit, this));
    return this;
  }
});

App.Models.Part = Backbone.Model.extend({
  validate: function(attrs) {
    var errors = [];
    if(!_.isUndefined(attrs.amount)) {
      if(attrs.amount.length === 0) {
        errors.push('amount is empty ');
      } else if(attrs.amount / attrs.amount !== 1.0) {
        errors.push('amount is not a number');
      }
    }
    if(!_.isUndefined(attrs.ingredient_id)) {
      //errors.push('an ingredient was not selected');
    }
    if(!_.isUndefined(attrs.ingredient)) {
      if(attrs.ingredient.name.length < 3) {
        errors.push('ingredient name is too short');
      }
    }
    if(!_.isUndefined(attrs.unit)) {
      // check that the val agrees with rails val
    }
    return _.any(errors) ? errors : false
  },
  percent: function() {
    var percent = as_percent(this.get('amount') / this.collection.getTotalMass('flour'))
    this.set({'percent' : percent});
  },
  initialize: function() {
    this.bind('change', this.percent, this);
    if(!this.validate(this.attributes)) {
      var id= this.id ? this.id : this.cid;
      this.view = new App.Views.Part({model: this, id: 'part_'+id})
    }
  }
})
App.Collections.PartList = Backbone.Collection.extend({
  model: App.Models.Part,
  getTotalMass: function(name) {
    return _.pluck(_.pluck(this.filter(function(part) {return part.get('ingredient').name == name}), 'attributes'), 'amount').reduce(function(a, b) {return a+b;}, 0)
  },
  stats: function() {
    var half_starter = this.getTotalMass('starter') / 2;
    var water = this.getTotalMass('water');
    var flour = this.getTotalMass('flour');
    var innoculation = half_starter / (flour + half_starter);
    return {
      hydration: as_percent((water + half_starter) / (flour + half_starter)),
      innoculation: as_percent(innoculation),
      doubling: truncate(-3 * Math.log(innoculation) / Math.log(2)),
      temp: 72
    }
  },
  flour_mass: function() {
    return this.getTotalMass('flour') + this.getTotalMass('starter')/2;
  },
  initialize: function() {
  }
})

