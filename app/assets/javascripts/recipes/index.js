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
    this.ingredients = new App.Collections.IngredientList(this.get('ingredients'));
    this.ingredients.url = '/recipe/'+this.id+'/ingredient';
    this.ingredients.parent = this;
    this.view = new App.Views.Recipe({model: this, id: 'recipe_'+this.id});
    $("#recipe_container").append(this.view.render().el);
    
    var ingredientViews = [];
    this.ingredients.each(function(i) {
      ingredientViews.push(new App.Views.Ingredient({model: i, id: 'ingredient_'+i.id, parentView: this.view})) 
    });
    this.ingredientViews = ingredientViews;
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
  render: function() {
    var template = _.template($('#recipe-li').html());
    $(this.el).html(template(this.model.toJSON()))
    console.log(this)
    return this;
  }
});
App.Views.Ingredient = Backbone.View.extend({
  tagName: 'li',
  events: {
  },
  initialize: function() {
    //console.log($('#'+this.options.parentView.id), this.options.parentView)
    console.log(this.options)
    $(this.options.parentView.el).find('.ingredients').append(this.render().el)
    this.render();
  },
  render: function() {
    var template = _.template($('#ingredient-li').html());
    $(this.el).html(template(this.model.toJSON()));
    return this;
  }
});

App.Models.Ingredient = Backbone.Model.extend({
  initialize: function() {
    
  }
})
App.Collections.IngredientList = Backbone.Collection.extend({
  model: App.Models.Ingredient,
  initialize: function() {
  }
})

