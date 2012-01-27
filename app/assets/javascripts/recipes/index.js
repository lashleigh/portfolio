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
    this.ingredients = new App.Collections.IngredientList
    this.view = new App.Views.Recipe({model: this, id: 'recipe_'+this.id});
    $("#recipe_container").append(this.view.render().el);
    
    this.ingredients.url = '/recipes/'+this.id+'/ingredients';
    this.ingredients.recipeView = this.view;
    this.ingredients.reset(this.get('ingredients'));
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
    'click .save-noob'    : 'saveIngredient',
  },
  saveIngredient: function() {
    var amount = this.new_amount.val();
    var name = this.new_name.val();
    var unit = $(this.el).find('.new-unit').val();
    if(!amount || !name) return;
    var newIng = this.model.ingredients.create({
      amount: amount,
      name: name,
      unit: unit
    })
    if(!!newIng) {
      this.new_amount.val('');
      this.new_name.val('');
    }
  },
  render: function() {
    var template = _.template($('#recipe-li').html());
    $(this.el).html(template(this.model.toJSON()))
    this.new_amount = $(this.el).find('.new-amount');
    this.new_name   = $(this.el).find('.new-name');
    return this;
  }
});
App.Views.Ingredient = Backbone.View.extend({
  tagName: 'li',
  className: 'ingredient',
  initialize: function() {
    $(this.model.collection.recipeView.el).find('#ingredient-list').append(this.render().el)
    this.model.bind('change', this.render, this);
    this.model.bind('destroy', this.remove, this);
  },
  events: {
    'click .amount' : 'editAmount',
    'click .name'   : 'editName',
    'click .destroy': 'clear',
    "keypress .edit-amount"      : "updateOnEnter",
    "keypress .edit-name"      : "updateOnEnter",
  },
  editAmount: function() {
    $(this.el).addClass('editing-amount') //.find('.edit-amount').removeClass('hidden').focus()
    this.input_amount.removeClass('hidden').focus()
  },
  editName: function() {
    $(this.el).addClass('editing-name') //.find('.edit-amount').removeClass('hidden').focus()
    this.input_name.removeClass('hidden').focus()
  },
  updateOnEnter: function(e) {
    if(e.keyCode == 13) {
      this.model.save({amount: this.input_amount.val(), name: this.input_name.val()});
      this.exitEditing();
      this.render(); //This extra call to render really belongs in the error function
    }
  },
  exitEditing: function() {
    this.input_amount.addClass('hidden');
    this.input_name.addClass('hidden');
    $(this.el).removeClass("editing-amount editing-name");
  },
  remove: function() {
    $(this.el).remove();
  },
  clear: function() {
    this.model.destroy();
  },
  render: function() {
    var template = _.template($('#ingredient-li').html());
    $(this.el).html(template(this.model.toJSON()));
    
    this.input_amount = $(this.el).find('.edit-amount'); 
    this.input_name = $(this.el).find('.edit-name');
    
    var amount = this.model.get('amount');
    var name = this.model.get('name');
    this.input_amount.bind('blur', _.bind(this.exitEditing, this)).val(amount);
    this.input_name.bind('blur', _.bind(this.exitEditing, this)).val(name);

    return this;
  }
});

App.Models.Ingredient = Backbone.Model.extend({
  validate: function(attrs) {
    if(attrs.amount / attrs.amount !== 1) {
      return 'The amount is not a number';
    } else {
      return false
    }
  },
  initialize: function() {
    if(!this.validate(this.attributes)) {
      this.view = new App.Views.Ingredient({model: this, id: 'ingredient_'+this.id})
    }
  }
})
App.Collections.IngredientList = Backbone.Collection.extend({
  model: App.Models.Ingredient,
  initialize: function() {
  }
})

