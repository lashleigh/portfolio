App.Views.Ingredient = Backbone.View.extend({
  initialize: function() {
  },
  events: {
    'keydown .name' : 'updateNameOnEnter',
    'change #category' : 'newCategory',
  },
  render: function() {
  },
  console: function() {
    console.log(this.model.get('name'));
  },
  updateNameOnEnter: function(e) {
    if(e.keyCode === 13) {
    e.preventDefault();
      console.log(this.$('.name').text());
      this.model.save({name : this.$('.name').text()})
    }
  },
  newCategory: function() {
    this.model.save({category: this.$('#category :selected').val()});
  }
})

App.Models.Ingredient = Backbone.Model.extend({
  initialize: function() {
    this.view = new App.Views.Ingredient({model : this })
    this.view.setElement($('#ingredient_'+this.id))
    this.view.model = this;
    //this.view.render();
  },
})
App.Collections.Ingredients = Backbone.Collection.extend({
  model : App.Models.Ingredient,
  url: '/ingredients',
})
