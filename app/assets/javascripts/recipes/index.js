function isNum(num) {
  return !!num && parseFloat(num) === num*1.0;
}

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
  url: '/recipes',
  initialize: function() {
    this.parts = new App.Collections.PartList;
    this.notes = new App.Collections.NoteList;
    this.view = new App.Views.Recipe({model: this, el: document.getElementById('recipe_container')});
    this.view.render();
    this.view.$el = $('#recipe_container'); //TODO not getting defined on its own - why it that?
    
    this.url = '/recipes/'+this.id; 
    this.parts.url = '/recipes/'+this.id+'/parts';
    this.parts.recipeView = this.view;
    this.parts.reset(this.get('parts'));
    //this.parts.bind('all', this.view.update_stats, this.view) //TODO this is excessive stats updates

    this.notes.url = '/recipes/'+this.id+'/notes';
    this.notes.recipeView = this.view;
    this.notes.reset(this.get('notes'));

    this.view.update_stats();
  }
});
App.Views.Recipe = Backbone.View.extend({
  events: {
    'click .editable span' : 'editField',
    'blur  .editable input': 'exitEditField',
    'keyup .editable input': 'updateTitle',
    //'click #recipe-title h1' : 'editTitle',
    //'blue  #title input': 'exitEditTitle',
    //'keyup #title input': 'updateTitle',

    'click #hydration' : 'editHydration', 
    'blur  #hydration input' : 'exitEditHydration', 
    'keyup #hydration input' : 'updateHydrationOnEnter', 
    
    'click #innoculation' : "editInnoculation",
    'blur  #innoculation input' : "exitEditInnoculation",
    'keyup #innoculation input' : "updateInnoculation",
    
    'keyup input#new-amount'      : "updateNewPercent",
    'keyup input#new-percent'     : "updateNewAmount",
    'click .add'    : 'newPart',
    'click .new-note' : "newNote",
    'keyup #new-note-body' : "resizeNote",
    'focus #new-note-body' : "resizeNote",
  },
  resizeNote: function() {
    var note = $('#new-note-body');
    note.css('height', note[0].scrollHeight+'px');
  },
  newNote: function() {
    this.model.notes.newNote();
  },
  editField: function(e) {
    $(e.currentTarget).next().focus().parent().addClass('editing');
    this.$el.find('#recipe-title input').val(this.model.get('title')).focus();
  },
  exitEditField: function(e) {
    $(e.currentTarget).parent().removeClass('editing');
  },
  updateTitle: function(e) {
    if(e.keyCode === 13) {
      var title = this.$el.find('#recipe-title input')
      this.model.save({title : title.val()});
      title.prev().text(title.val()).parent().removeClass('editing');
    }     
  },
  editTitle: function(e) {
    this.$el.find('#recip-title span').parent().addClass('editing');
    this.$el.find('#recipe-title input').focus();
     //this.$el.find('#title').addClass('editing-title').find('input').focus();
  },
  editInnoculation: function() {
    this.$el.find('#innoculation').addClass('editing').find('input').focus();
  }, 
  exitEditInnoculation: function() {
    this.$el.find('#innoculation').removeClass('editing');
  }, 
  updateInnoculation: function(e) {
    if(e.keyCode === 13) {
      var inn = $('#innoculation input').val();
      if(!isNum(inn)) return;
      var starter = this.model.parts.filter(function(p) {return p.get('ingredient').name === 'starter'; })[0];
      var flour =   this.model.parts.filter(function(p) {return p.get('ingredient').name === 'flour'; })[0];
      var water =   this.model.parts.filter(function(p) {return p.get('ingredient').name === 'water'; })[0];
      var total_flour = this.model.parts.flour_mass();
      var half_starter = inn / 100.0 * total_flour;
      var hydration = this.hydration.find('span').text();
      starter.save({amount: truncate(half_starter*2)})
      flour.save({amount: truncate(total_flour - half_starter)})
      water.save({amount: truncate(hydration / 100.0 * total_flour - half_starter)})
      this.exitEditInnoculation();
      this.update_stats();
    }
  },
  editHydration: function() {
    this.hydration.addClass('editing');
    this.hydration_input.focus();
  }, 
  exitEditHydration: function() {
    this.hydration.removeClass('editing');
  }, 
  newWaterMass: function() {
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
  }, 
  updateHydrationOnEnter: function(e) {
    if(e.keyCode == 13) {
      this.newWaterMass();
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
    this.hydration        = $(this.el).find('#hydration');
    this.hydration_input  = this.hydration.find('input');
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
  },
  render: function() {
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
    $('#new-note').after(this.render().el);
    this.model.bind('change', this.render, this);
    this.setHeight();
    this.$el = $(this.el);
  },
  events: {
    'click .body'  : 'editBody',
    'click .body-cancel'  : 'exitEditBody',
    'click .body-submit'  : 'updateBody', 
    'click .remove' : 'destroy',
    'keyup .body-input': 'updateBodyHeight',
  }, 
  destroy: function() {
    this.model.destroy();
    $(this.el).remove();
  }, 
  editBody: function() {
    this.$el.addClass('editing');
    this.body_input.focus();
  }, 
  exitEditBody: function() {
    this.$el.removeClass('editing');
  }, 
  updateBody: function() {
    this.model.save({'body' : this.body_input.val()});
    this.exitEditBody();
  },
  localTime: function() {
    var d = new Date(this.model.get('time'));
    var hours = d.getHours();
    var minutes = d.getMinutes();
    if(minutes < 10) minutes = '0'+minutes;
    var am_pm = ' am';
    if(hours >= 12) {
      am_pm = ' pm';
      hours = hours - 12 ? hours - 12 : 12; 
    }
    var simple_time = hours+':'+minutes+am_pm;

    var today = new Date();
    var delta_in_days = (today - d) / (1000*60*60*24);
    var view_ago;
    if(delta_in_days < 1) {
      view_ago = 'today';
    } else if(delta_in_days < 2) {
      view_ago = 'yesterday';
    } else {
      view_ago = Math.floor(delta_in_days) + ' days ago';
    }
    return view_ago + ' at ' + simple_time; 
  }, 
  updateBodyHeight: function() {
    this.body_input.css('height', this.body_input[0].scrollHeight+'px');
  },
  setHeight: function() {
    this.body_input.css('height', this.note_body.css('height'));
  },
  render: function() {
    var template = _.template(this.template);
    $(this.el).html(template(this.model.toJSON()));
    $(this.el).find('.time').text(this.localTime());
    this.note_body = $(this.el).find('.body');
    this.body_input = $(this.el).find('.body-input');
    this.setHeight();
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
    'click .editable span' : 'editField',
    'click .remove': 'clear',
    'click .fixed-percent-input': 'toggleFixedPercent',
    "keypress .edit-amount"      : "updateAmountOnEnter",
    "keypress .edit-name"      : "updateIngredientOnEnter",
    "keypress .edit-percent"   : "updatePercentOnEnter",
  },
  toggleFixedPercent: function() {
    this.model.save({'fixed_percent': !this.model.get('fixed_percent')});
  },
  editField: function(e) {
    $(e.currentTarget).next().focus().parent().addClass('editing');
    this.input_name.val(this.model.get('ingredient').name);
    this.input_amount.val(this.model.get('amount'));
    this.input_percent.val(this.model.get('percent'));
  },
  updatePercentOnEnter: function(e) {
    if(e.keyCode == 13) {
      var percent = truncate(this.input_percent.val());
      var amount = truncate(percent / 100 * this.model.collection.flour_mass()); 
      this.model.save({amount: amount, percent: percent});
    }
  },
  updateAmountOnEnter: function(e) {
    if(e.keyCode == 13) {
      var amount = truncate(this.input_amount.val());
      var percent = as_percent(amount / this.model.collection.flour_mass());
      this.model.save({amount: amount, percent: percent});
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
  },
  exitEditing: function(e) {
    $(e.currentTarget).parent().removeClass('editing');
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
    if(!this.model.get('primary')) {
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
      this.bind('change', this.updatePercents, this);
      this.bind('change', this.maintainHydration, this);
    }
  },
  maintainHydration: function() {
    this.collection.recipeView.newWaterMass();
    this.collection.recipeView.update_stats();
  },
  updatePercents: function() {
    var flour = this.collection.flour_mass();
    var need_update = this.collection.filter(function(part) { return (part !== this) && (part.get('primary') === false); })
    _.each(need_update, function(part) {
      if(part.get('fixed_percent')) {
        part.save({amount: truncate(part.get('percent')/100 * flour)});
      } else {
        part.save({percent: as_percent(part.get('amount') / flour)});
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
  },
  newNote: function() {
    var body = $('#new-note-body').val();
    if(!body) return 
    var note = this.create({
      time: (new Date()).toUTCString(),
      body : $('#new-note-body').val(),
    })
    //TODO make this part of a success callback
    $('#new-note-body').val('');
  }, 
});
App.Collections.Recipes = Backbone.Collection.extend({
  model: App.Models.Recipe,
  url: '/recipes'
});
