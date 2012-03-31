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
function isNum(num) {
  return !!num && parseFloat(num) === num*1.0;
}

App.Models.Recipe = Backbone.NestedModel.extend({
  url: '/recipes',
  initialize: function() {
    this.parts = new App.Collections.PartList;
    this.notes = new App.Collections.NoteList;
    this.view = new App.Views.Recipe({model: this})
    this.view.setElement(document.getElementById('recipe_container'));
    this.view.render();
    
    this.url = '/recipes/'+this.id; 
    this.parts.url = '/recipes/'+this.id+'/parts';
    this.parts.recipeView = this.view;
    this.parts.reset(this.get('parts_name'));
    this.parts.initializeAfterReset();
    this.parts.bind('all', this.view.update_stats, this.view) //TODO this is excessive stats updates

    this.notes.url = '/recipes/'+this.id+'/notes';
    this.notes.recipeView = this.view;
    this.notes.reset(this.get('notes_md'));

    this.view.update_stats();
  }
});
App.Views.Recipe = Backbone.View.extend({
  events: {
    'keydown #recipe-title .val': 'updateTitleOnEnter', 
    //'keydown #hydration    .val': 'updateHydrationOnEnter',
    //'keydown #inoculation  .val': 'updateInoculationOnEnter',
    //'keydown #flour-mass   .val': 'updateMassOnEnter',
    'blur #recipe-title .val' : 'resetTitle',
    //'blur #hydration .val' : 'resetHydration',
    //'blur #inoculation .val' : 'resetInoculation',

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
  resetHydration: function() {
    //TODO reset the hydration if it isn't saved
    //$('#hydration .val').text(this.model
  },
  resetTitle: function() {
    $('#recipe-title .val').text(this.model.get('title'));
  },
  resetInoculation: function() {
  },
  updateTitleOnEnter: function(e) {
    if(e.keyCode === 13) {
      e.preventDefault();
      var title = this.$('#recipe-title .val')
      this.model.save({title : title.text()}, { success: function(model, response) {
          }, error: function(model, response) {
          }
      });
      title.blur();
    }     
  },
  updateInoculationOnEnter: function(e) {
    if(e.keyCode === 13) {
      e.preventDefault();
      var inn = $('#inoculation .val').text();
      if(!isNum(inn)) return;
      var starter = this.model.parts.starter; //filter(function(p) {return p.get('ingredient.name') === 'starter'; })[0];
      var flour =   this.model.parts.flour; //filter(function(p) {return p.get('ingredient.name') === 'flour'; })[0];
      var water =   this.model.parts.water; //filter(function(p) {return p.get('ingredient.name') === 'water'; })[0];
      var total_flour = this.model.parts.flour_mass();
      var half_starter = inn / 100.0 * total_flour;
      var hydration = this.hydration.find('span').text();
      starter.save({amount: truncate(half_starter*2)})
      flour.save({amount: truncate(total_flour - half_starter)})
      water.save({amount: truncate(hydration / 100.0 * total_flour - half_starter)})
      this.update_stats();
    }
  },
  updateMassOnEnter: function(e) {
    if(e.keyCode === 13) {
      e.preventDefault();
    }
  },
  newWaterMass: function() {
    var water = this.model.parts.water; //filter(function(p) { return p.get('ingredient.name') === 'water'; })[0];
    var hydration = this.hydration_val.text();
    var total_water = this.model.parts.water_mass();
    var total_flour = this.model.parts.flour_mass();
    var min_hydration = (total_water - water.get('amount')) / total_flour * 100;
    if(min_hydration < hydration) {
      var new_water_mass = truncate((hydration - min_hydration) / 100.0 * total_flour);
      var percent = as_percent(new_water_mass / total_flour);
      water.save({amount: new_water_mass, percent: percent});
    } else {
      //TODO flash warning OR change the flour
    }
  }, 
  updateHydrationOnEnter: function(e) {
    if(e.keyCode == 13) {
      e.preventDefault();
      this.newWaterMass();
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
    this.$('#stats').html(template(this.model.parts.stats()));
    this.hydration        = this.$('#hydration');
    this.hydration_val  = this.hydration.find('.val');
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
      this.$('#new-part').find('input').val('');
    }
  },
  render: function() {
    this.new_amount       = this.$('#new-amount');
    this.new_percent      = this.$('#new-percent');
    this.new_name         = this.$('#new-name');
    this.new_name_id      = this.$('#new-name-id');
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
      hours = hours - 12;
    }
    if(!hours) hours = 12;
    return hours+':'+minutes+am_pm;
  },
  getLocalTime: function() {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var d = new Date(this.model.get('time'));
    var delta_in_hours = (new Date() - d) / (1000*60*60);
    return time_ago(delta_in_hours, this); 

    function time_ago(delta, that) {
      if(delta < 1) {
        return Math.round(delta*60)+'m ago';
      } else if(delta < 4) {
        return Math.floor(delta)+'h '+ Math.round((delta-Math.floor(delta))*60)+ 'm ago';
      } else if(delta < 24) {
        return Math.round(delta) + 'h ago';
      } else if(delta < 96) {
        return Math.floor(delta/24)+'d '+ Math.round((delta/24-Math.floor(delta/24))*24)+ 'h ago';
      } else {
        return d.getDate()+' '+months[d.getMonth()]+' @ '+that.localTime();
      }
    }
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
    this.$('.time').text(this.getLocalTime());
    this.note_body = this.$('.body');
    this.body_input = this.$('.body-input');
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
    'click .editable span ' : 'editField',
    'click .remove': 'clear',
    'click .fixed-percent-input': 'toggleFixedPercent',
    'focusin .editable input'  : 'toggleEditingClass',
    'focusout .editable input' : 'toggleEditingClass',
    "keyup .edit-amount"    : "updateAmountOnEnter",
    "keyup .edit-name"      : "updateIngredientOnEnter",
    "keyup .edit-percent"   : "updatePercentOnEnter",
  },
  toggleFixedPercent: function() {
    this.$('button.fixed-percent-input').toggleClass('lock unlock danger positive')
    this.model.save({'fixed_percent': !this.model.get('fixed_percent')});
  },
  toggleEditingClass: function(e) {
    this.$(e.currentTarget).parent().toggleClass('editing')
  },
  editField: function(e) {
    $(e.currentTarget).next().focus();
    this.input_name.val(this.model.get('ingredient.name'));
    this.input_amount.val(this.model.get('amount'));
    this.input_percent.val(this.model.get('percent'));
  },
  updatePercentOnEnter: function(e) {
    if(e.keyCode == 13) {
      var percent = truncate(this.input_percent.val());
      var amount = truncate(percent / 100 * this.model.collection.flour_mass()); 
      this.model.save({amount: amount, percent: percent});
    } else if(e.keyCode == 27) {
      //TODO This doesn't work and I'm not sure why
      //$(e.currentTarget).blur();
    }
  },
  updateAmountOnEnter: function(e) {
    if(e.keyCode == 13) {
      var amount = truncate(this.input_amount.val());
      var percent = as_percent(amount / this.model.collection.flour_mass());
      this.model.save({amount: amount, percent: percent});
    } else if(e.keyCode == 27) {
    }
  },
  updateIngredientOnEnter: function(e) {
    if(e.keyCode == 13) {
      this.saveIngredient();
    } else if(e.keyCode == 27) {
    }
  },
  saveIngredient: function() {
    this.model.save({
      ingredient_id: this.input_name_id.val(), 
      ingredient: {
        name: this.input_name.val(),
      }
    })
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
    
    this.input_amount = this.$('.edit-amount'); 
    this.input_percent= this.$('.edit-percent'); 
    this.input_name = this.$('.edit-name');
    this.input_name_id=this.$('.edit-name-id');
    
    this.input_name.autocomplete(this.autocomplete());

    
    if(!this.model.get('primary')) {
      this.model.get('fixed_percent') ? this.$('button.fixed-percent-input').addClass('lock positive') : this.$('button.fixed-percent-input').addClass('unlock danger');
    }
    return this;
  }
});

App.Models.Part = Backbone.NestedModel.extend({
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
    this.view = new App.Views.Part({model: this, id: 'part_'+this.id});
    this.on('change:ingredient.category', function(model, category) {
      console.log(model, category);
    });
    if(this.get('ingredient.category') === 'flour' || this.get('ingredient.name') === 'starter' ) {
      this.bind('change', this.updatePercents, this);
      this.bind('change', this.collection.recipeView.update_stats, this.collection.recipeView);
      //this.bind('change', this.maintainHydration, this);
    } else if(this.get('ingredient.category') === 'water') {
      this.bind('change', this.collection.recipeView.update_stats, this.collection.recipeView);
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
  initializeAfterReset: function() {
    this.starter = this.where({'ingredient.name' : 'starter' })[0];
    this.flour = this.where({'ingredient.name' : 'flour' })[0];
    this.water = this.where({'ingredient.name' : 'water' })[0];
  },
  getTotalMassByCategory: function(category) {
    return _(this.where({'ingredient.category' : category })).map(function(a) {return a.get('amount');}).reduce(function(a,b) {return a+b;}, 0);
  },
  getTotalMass: function(name) {
    return _(this.where({'ingredient.name'     : name     })).map(function(a) {return a.get('amount');}).reduce(function(a,b) {return a+b;}, 0);
  },
  stats: function() {
    var half_starter = this.getTotalMass('starter') / 2;
    var water = this.getTotalMassByCategory('water');
    var flour = this.getTotalMassByCategory('flour');
    var inoculation = half_starter / (flour + half_starter);
    return {
      hydration: as_percent((water + half_starter) / (flour + half_starter)),
      inoculation: as_percent(inoculation),
      flour_mass: truncate(flour+half_starter),
      doubling: truncate(-3 * Math.log(inoculation) / Math.log(2)),
      temp: 72
    }
  },
  flour_mass: function() {
    return this.getTotalMassByCategory('flour') + this.getTotalMass('starter')/2;
  },
  water_mass: function() {
    return this.getTotalMassByCategory('water') + this.getTotalMass('starter')/2;
  }, 
  initialize: function() {
  }
})
App.Models.Note = Backbone.NestedModel.extend({
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
      markdown : $('#new-note-body').val(),
    })
    //TODO make this part of a success callback
    $('#new-note-body').val('');
  }, 
});
App.Collections.Recipes = Backbone.Collection.extend({
  model: App.Models.Recipe,
  url: '/recipes'
});
