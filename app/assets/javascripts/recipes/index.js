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
    this.ingredients.parentModel = this;
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
    console.log('new ingredient', this.id);
  },
  saveIngredient: function() {
    var amount = $(this.el).find('.new-amount').val();
    var name = $(this.el).find('.new-name').val();
    if(!amount || !name) return;
    var newIng = this.model.ingredients.create({
      amount: amount,
      name: name,
      parentModel: this.model
    })
    console.log('save ingredient', amount, name, newIng) 
  },
  render: function() {
    var template = _.template($('#recipe-li').html());
    $(this.el).html(template(this.model.toJSON()))
    return this;
  }
});
App.Views.Ingredient = Backbone.View.extend({
  tagName: 'li',
  events: {
    'click .amount' : 'clicked'
  },
  clicked: function() {
    console.log('amount', this)
  },
  initialize: function() {
    console.log('ingredient view', this)
    $(this.model.collection.parentModel.view.el).find('.ingredients').append(this.render().el)
  },
  render: function() {
    var template = _.template($('#ingredient-li').html());
    $(this.el).html(template(this.model.toJSON()));
    return this;
  }
});

App.Models.Ingredient = Backbone.Model.extend({
  initialize: function() {
    console.log('ingredient model init', this) 
    this.view = new App.Views.Ingredient({model: this, id: 'ingredient_'+this.id})
  }
})
App.Collections.IngredientList = Backbone.Collection.extend({
  model: App.Models.Ingredient,
  initialize: function() {
  }
})

