var App = {
  Collections: {},
  Views: {},
  Models: {}
}

App.Models.Recipe = Backbone.Model.extend({
  defaults: {
    yabab: 'does this work?'
  },
  initialize: function() {
    this.parts = new App.Collections.PartList
    this.view = new App.Views.Recipe({model: this, id: 'recipe_'+this.id});
    $("#recipe_container").append(this.view.render().el);
    
    this.parts.url = '/recipes/'+this.id+'/parts';
    this.parts.recipeView = this.view;
    this.parts.reset(this.get('parts'));
  }
})
App.Collections.Recipes = Backbone.Collection.extend({
  model: App.Models.Recipe,
  url: '/recipes',
})

App.Views.Recipe = Backbone.View.extend({
  tagName: 'li',
  className: 'recipe',
  events: {
    'click .add'    : 'savePart',
  },
  savePart: function() {
    var amount = this.new_amount.val();
    var name = this.new_name.val();
    var id = this.new_name_id.val();
    var unit = $(this.el).find('.new-unit').val();
    console.log(amount, name, unit, id)
    if(!amount || !name) return;
    var newIng = this.model.parts.create({
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
    $(this.model.collection.recipeView.el).find('#part-list').append(this.render().el)
    this.model.bind('change', this.render, this);
    this.model.bind('destroy', this.remove, this);
  },
  events: {
    'click .amount' : 'editAmount',
    'click .name'   : 'editName',
    'click .unit'   : 'editUnit',
    'click .remove': 'clear',
    "keypress .edit-amount"      : "updateOnEnter",
    "keypress .edit-name"      : "updateOnEnter",
  },
  editAmount: function() {
    $(this.el).addClass('editing-amount');
    this.input_name.val(this.model.get('name'));
    this.input_amount.removeClass('hidden').focus();
  },
  editName: function() {
    $(this.el).addClass('editing-name'); 
    this.input_amount.val(this.model.get('amount'));
    this.input_name.removeClass('hidden').focus();
  },
  editUnit: function() {
    $(this.el).addClass('editing-unit'); ///.find('.edit-unit').removeClass('hidden').select(this.model.get('unit'))
    this.input_name.val(this.model.get('name'));
    this.input_amount.val(this.model.get('amount'));
    this.select_unit.removeClass('hidden').val(this.model.get('unit')).focus();
  },
  updateOnEnter: function(e) {
    if(e.keyCode == 13) {
      this.model.save({amount: this.input_amount.val(), name: this.input_name.val()});
      this.exitEditing();
    }
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
  render: function() {
    var template = _.template($('#part-li').html());
    $(this.el).html(template(this.model.toJSON()));
    
    this.input_amount = $(this.el).find('.edit-amount'); 
    this.input_name = $(this.el).find('.edit-name');
    this.select_unit = $(this.el).find('.edit-unit');
    
    var attrs = this.model.attributes;
    this.input_amount.bind('blur', _.bind(this.exitEditing, this)).val(attrs.amount);
    this.input_name.bind('blur', _.bind(this.exitEditing, this)).val(attrs.name);
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
    if(!_.isUndefined(attrs.unit)) {
      // check that the val agrees with rails val
    }
    console.log(errors, attrs)
    return _.any(errors) ? errors : false
  },
  initialize: function() {
    if(!this.validate(this.attributes)) {
      this.view = new App.Views.Part({model: this, id: 'part_'+this.id})
    }
  }
})
App.Collections.PartList = Backbone.Collection.extend({
  model: App.Models.Part,
  initialize: function() {
  }
})

