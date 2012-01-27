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
  initialize: function() {
  }
})

App.Views.Recipe = Backbone.View.extend({
  tagName: 'li',
  className: 'recipe',
  events: {
    'click .newIngredient': 'newIngredient',
    'click .save-noob'    : 'saveIngredient',
  },
  newIngredient: function() {
    $(this.el).append($('#new-ingredient').html())
  },
  saveIngredient: function() {
    var amount = $(this.el).find('.new-amount').val();
    var name = $(this.el).find('.new-name').val();
    if(!amount || !name) return;
    var newIng = this.model.ingredients.create({
      amount: amount,
      name: name
    })
  },
  render: function() {
    var template = _.template($('#recipe-li').html());
    $(this.el).html(template(this.model.toJSON()))
    return this;
  }
});
App.Views.Ingredient = Backbone.View.extend({
  tagName: 'li',
  initialize: function() {
    $(this.model.collection.recipeView.el).find('.ingredients').append(this.render().el)
    this.model.bind('change', this.render, this);
    this.model.bind('destroy', this.remove, this);
  },
  events: {
    'click .amount' : 'editAmount',
    'click .name'   : 'editName',
    'click .destroy': 'clear',
    "keypress .edit-amount"      : "updateOnEnter"
  },
  editAmount: function() {
    $(this.el).addClass('editing') //.find('.edit-amount').removeClass('hidden').focus()
    this.input_amount.removeClass('hidden').focus()
  },
  editName: function() {
  },
  updateOnEnter: function(e) {
    if(e.keyCode == 13) {
      this.model.save({amount: this.input_amount.val()});
      this.exitEditing();
      this.render(); //This extra call to render really belongs in the error function
    }
  },
  exitEditing: function() {
    this.input_amount.addClass('hidden');
    $(this.el).removeClass("editing");
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
    this.input_amount.bind('blur', _.bind(this.exitEditing, this)).val(amount);

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

