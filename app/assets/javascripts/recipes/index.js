var App = {
  Collections: {},
  Views: {},
  Models: {}
}
as_percent = function(num) {
  return Math.round(10000*num) / 100;
}
truncate = function(num) {
  return Math.round(100*num) / 100;
}

App.Models.Recipe = Backbone.Model.extend({
  initialize: function() {
    this.parts = new App.Collections.PartList;
    this.notes = new App.Collections.NoteList;
    this.view = new App.Views.Recipe({model: this, id: 'recipe_'+this.id});
    $("#recipe_container").append(this.view.render().el);
    
    this.parts.url = '/recipes/'+this.id+'/parts';
    this.parts.recipeView = this.view;
    this.parts.reset(this.get('parts'));
    this.parts.bind('all', this.view.update_stats, this.view)

    this.notes.url = '/recipes/'+this.id+'/notes';
    this.notes.recipeView = this.view;
    this.notes.reset(this.get('notes'));

    this.view.update_stats();
  }
});
App.Views.Recipe = Backbone.View.extend({
  tagName: 'div',
  className: 'recipe',
  events: {
    'click .add'    : 'newPart',
    'click .hydration' : 'editHydration', 
    'blur .edit-hydration' : 'exitEditHydration', 
    'keypress .edit-hydration' : 'updateHydrationOnEnter', 
    'keyup input#new-amount'      : "updateNewPercent",
    'keyup input#new-percent'     : "updateNewAmount",
  },
  editHydration: function() {
    $(this.el).addClass('editing-hydration');
    $(this.el).find('.edit-hydration').removeClass('hidden').focus();
  }, 
  exitEditHydration: function() {
    $(this.el).removeClass('editing-hydration');
    $(this.el).find('.edit-hydration').addClass('hidden');
  }, 
  updateHydrationOnEnter: function(e) {
    if(e.keyCode == 13) {
      var water = this.model.parts.filter(function(p) { return p.get('ingredient').name === 'water'; })[0];
      var hydration = this.hydration_input.val();
      var total_water = this.model.parts.water_mass();
      var total_flour = this.model.parts.flour_mass();
      var min_hydration = (total_water - water.get('amount')) / total_flour * 100;
      if(min_hydration < hydration) {
        var new_water_mass = ((hydration - min_hydration) / 100.0 * total_flour);
        var percent = as_percent(new_water_mass / total_flour);
        water.save({amount: new_water_mass, percent: percent});
      } else {
        //TODO flash warning OR change the flour
      }
      this.exitEditHydration();
      this.update_stats();
    }
  },
  updateNewPercent: function() {
    var percent = as_percent(this.new_amount.val() / this.model.parts.flour_mass());
    this.new_percent.val('');
    this.new_percent.attr('placeholder', percent);
  },
  updateNewAmount: function() {
    var amount = truncate(this.new_percent.val() / 100.0 * this.model.parts.flour_mass());
    this.new_amount.val('');
    this.new_amount.attr('placeholder', amount);
  },
  update_stats: function() {
    var template = _.template($('#recipe-stats').html());
    $(this.el).find('.stats').html(template(this.model.parts.stats()));
    this.hydration_input  = $(this.el).find('.edit-hydration');
  },
  newPart: function() {
    var amount = this.new_amount.val();
    var percent = this.new_percent.val();
    var name = this.new_name.val();
    var id = this.new_name_id.val();
    var fixed_percent = false;
    if(!name) return;
    if(isNum(percent)) {
      amount = truncate(percent/100.0 * this.model.parts.flour_mass());
      fixed_percent = true;
    } else if(isNum(amount)) {
      percent = as_percent(amount / this.model.parts.flour_mass());
    } else { return; }
    var newIng = this.model.parts.create({
      percent: percent, 
      amount: amount,
      ingredient_id: id,
      fixed_percent: fixed_percent,
      ingredient: {
        name: name
      }
    })
    if(!!newIng) {
      $(this.el).find('#new-part').find('input').val('');
    }
    function isNum(num) {
      return !!num && parseFloat(num) === num*1.0;
    }
  },
  render: function() {
    var template = _.template($('#recipe-li').html());
    $(this.el).html(template(this.model.toJSON()));
    this.new_amount       = $(this.el).find('#new-amount');
    this.new_percent      = $(this.el).find('#new-percent');
    this.new_name         = $(this.el).find('#new-name');
    this.new_name_id      = $(this.el).find('#new-name-id');
    return this;
  }
});
App.Views.Note = Backbone.View.extend({
  tagName: 'div',
  className: 'note',
  initialize: function() {
    this.template = $('#note-li').html();
    $('#notes_container').append(this.render().el);
    this.model.bind('change', this.render, this);
  },
  events: {
    'click .body'  : 'editBody',
    'click .body-cancel'  : 'exitEditBody',
    'click .body-submit'  : 'updateBody', 
  }, 
  editBody: function() {
    this.note_body.addClass('hidden');
    this.edit_body.removeClass('hidden');
    this.body_input.focus();
  }, 
  exitEditBody: function() {
    this.note_body.removeClass('hidden');
    this.edit_body.addClass('hidden');
  }, 
  updateBody: function() {
    console.log('save changes');
    this.model.save({'body' : this.body_input.val()});
    this.exitEditBody();
  },
  render: function() {
    var template = _.template(this.template);
    $(this.el).html(template(this.model.toJSON()));
    this.note_body = $(this.el).find('.body');
    this.body_input = $(this.el).find('.body-input');
    this.edit_body  = $(this.el).find('.edit-body');
    return this;
  } 
});
App.Views.Part = Backbone.View.extend({
  tagName: 'tr',
  className: 'part',
  initialize: function() {
    this.template = this.model.get('primary') ? $('#primary-part-li').html() : $('#part-li').html();
    $(this.model.collection.recipeView.el).find('#part-list').append(this.render().el)
    this.model.bind('change', this.render, this);
    this.model.bind('destroy', this.remove, this);
  },
  events: {
    'click .amount' : 'editAmount',
    'click .percent': 'editPercent',
    'click .name'   : 'editName',
    'click .remove': 'clear',
    'click .fixed-percent-input': 'toggleFixedPercent',
    "keypress .edit-amount"      : "updateAmountOnEnter",
    "keypress .edit-name"      : "updateIngredientOnEnter",
    "keypress .edit-percent"   : "updatePercentOnEnter",
  },
  toggleFixedPercent: function() {
    this.model.save({'fixed_percent': !this.model.get('fixed_percent')});
  },
  editAmount: function(event) {
    this.resetFields('editing-amount');
    this.input_amount.removeClass('hidden').focus();
  },
  editPercent: function() {
    this.resetFields('editing-percent');
    this.input_percent.removeClass('hidden').focus();
  },
  editName: function() {
    this.resetFields('editing-name');
    this.input_name.removeClass('hidden').focus();
  },
  resetFields: function(editing_field) {
    $(this.el).addClass(editing_field);
    this.input_name.val(this.model.get('ingredient').name);
    this.input_amount.val(this.model.get('amount'));
    this.input_percent.val(this.model.get('percent'));
  },
  updatePercentOnEnter: function(e) {
    if(e.keyCode == 13) {
      var percent = truncate(this.input_percent.val());
      var amount = truncate(percent / 100 * this.model.collection.flour_mass()); 
      this.model.save({amount: amount, percent: percent});
      this.exitEditing();
    }
  },
  updateAmountOnEnter: function(e) {
    if(e.keyCode == 13) {
      var amount = this.input_amount.val();
      var percent = as_percent(amount / this.model.collection.flour_mass());
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
  exitEditing: function() {
    this.input_amount.addClass('hidden');
    this.input_name.addClass('hidden');
    this.input_percent.addClass('hidden');
    $(this.el).removeClass("editing-amount editing-name editing-percent");
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
  truncate: function(hash) {
    hash.amount = truncate(hash.amount);
    hash.percent = truncate(hash.percent);
    return hash
  },
  render: function() {
    var template = _.template(this.template);
    $(this.el).html(template(this.model.toJSON()));
    
    this.input_amount = $(this.el).find('.edit-amount'); 
    this.input_percent= $(this.el).find('.edit-percent'); 
    this.input_name = $(this.el).find('.edit-name');
    this.input_name_id=$(this.el).find('.edit-name-id');
    
    var attrs = this.model.attributes;
    this.input_amount.bind('blur', _.bind(this.exitEditing, this)).val(attrs.amount);
    this.input_percent.bind('blur', _.bind(this.exitEditing, this)).val(attrs.percent);
    this.input_name.bind('blur', _.bind(this.exitEditing, this)).val(attrs.ingredient.name).autocomplete(this.autocomplete());
    if(this.model.get('primary')) {
    } else {
      this.el.getElementsByClassName('fixed-percent-input')[0].checked = this.model.get('fixed_percent');
    }
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
    return _.any(errors) ? errors : false
  },
  initialize: function() {
    if(!this.validate(this.attributes)) {
      var id= this.id ? this.id : this.cid;
      this.view = new App.Views.Part({model: this, id: 'part_'+id})
    }
    if(this.get('ingredient').name === 'flour' || this.get('ingredient').name === 'starter' ) {
      this.bind('change', this.updatePercents, this)
    }
  },
  updatePercents: function() {
    var flour = this.collection.getTotalMass('flour') + this.collection.getTotalMass('starter') / 2;
    var that = this;
    var need_update = this.collection.filter(function(part) { return (part !== that) && (part.get('primary') === false); })
    _.each(need_update, function(part) {
      if(part.get('fixed_percent')) {
        part.set({amount: truncate(part.get('percent')/100 * flour)});
      } else {
        part.set({percent: as_percent(part.get('amount') / flour)});
      }
    })
  },
})
App.Collections.PartList = Backbone.Collection.extend({
  model: App.Models.Part,
  getTotalMass: function(name) {
    return _.pluck(_.pluck(this.filter(function(part) {return part.get('ingredient').name == name}), 'attributes'), 'amount').reduce(function(a, b) {return parseFloat(a)+parseFloat(b);}, 0)
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
  water_mass: function() {
    return this.getTotalMass('water') + this.getTotalMass('starter')/2;
  }, 
  initialize: function() {
  }
})
App.Models.Note = Backbone.Model.extend({
  initialize: function() {
    this.view = new App.Views.Note({model: this, id: 'note_'+this.id})
  } 
});
App.Collections.NoteList = Backbone.Collection.extend({
  model: App.Models.Note,
  initialize: function() {
  }
});
App.Collections.Recipes = Backbone.Collection.extend({
  model: App.Models.Recipe,
  url: '/recipes'
});
