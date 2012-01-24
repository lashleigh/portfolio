var App = {
  Collections: {},
  Controllers: {},
  Views: {},
  Models: {},
  init: function() {
    console.log('starting')
    new App.Controllers.Recipes();
    Backbone.history.start();
  }
}

App.Controllers.Recipes = Backbone.Router.extend({
  routes: {
    "recipes/:id":  "edit",
    "": "index",
    "new": "newRecipe"
  },

  edit: function(id) {
    var recipe = new App.Models.Recipe({id: id});
    console.log(recipe)
    recipe.fetch({
      success: function(model, resp) {
        new App.Views.Edit({model: recipe});
      },
      error: function() {
        new Error({message: 'could not find the recipe'});
      }
    })
  },
  index: function() {
    $.getJSON('/recipes', function(data) {
    console.log(data)
      if(data) {
        var recipes = _(data).map(function(r) {return new Recipe(r); });
        console.log(recipes)
        new App.Views.Index({recipes: recipes})
      } else {
        new Error({message: 'Error loading recipes'});
      }
    })
  },
  newRecipe: function() {
    new App.Views.Edit({ model: new Recipe()});
  }

})
App.Models.Recipe = Backbone.Model.extend({
  url: function() {
    return '/recipes'+this.id;
  },
  defaults: {
    yabab: 'does this work?'
  },
  initialize: function() {
    console.log(this.get('ingredients'));
    this.ingredients = new App.Collections.IngredientList(this.get('ingredients'));
    this.ingredients.url = '/recipe/'+this.id+'/ingredient';
  }
})
App.Views.Index = Backbone.View.extend({
  initialize: function() {
    this.recipes = this.options.recipes;
    this.render();
  },
  render: function() {
    if(this.recipes) {
    } else {
    }
  }
})
App.Views.Edit = Backbone.View.extend({

})

App.Models.Ingredient = Backbone.Model.extend({
  
})
App.Collections.IngredientList = Backbone.Collection.extend({
  model: App.Models.Ingredient,
  initialize: function() {
  }
})


