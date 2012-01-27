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
  events: {
    'click .amount' : 'clicked'
  },
  clicked: function() {
  },
  initialize: function() {
    $(this.model.collection.recipeView.el).find('.ingredients').append(this.render().el)
  },
  render: function() {
    var template = _.template($('#ingredient-li').html());
    $(this.el).html(template(this.model.toJSON()));
    return this;
  }
});

App.Models.Ingredient = Backbone.Model.extend({
  validate: function(attrs) {
    if(!attrs.amount) {
      return 'You must supply an amount';
    } else if(!attrs.name) {
      return 'You must supply a name';
    } else if(attrs.amount / attrs.amount !== 1) {
      return 'The amount is not a number';
    } else {
      return false
    }
  },
  initialize: function() {
    console.log(this.validate(this.attributes))
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

