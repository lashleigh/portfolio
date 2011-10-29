function Show(info) {
  this.id     = info.id;
  this.width  = info.width;
  this.height = info.height;
  this.scripts = info.scripts;
  this.current;
  this.slides = [];
  this.num_slides;
  this.mode = {'reduced':false, 'coding':false}; //coding, expose, edit, presentation
  this.current_scale;
  this.interval;
  this.set_class_margins();
  this.add_custom_styles(info);
  
  return this;
}
Show.prototype.add_custom_styles = function(info) {
  var show = this;
  var s = document.styleSheets[0];
  var end = s.cssRules.length;
  var gs = 0.4;
  s.insertRule('.gridify {margin-top:'+(-1)*(show.height*(1-gs)/2)+'px;'+
                        'margin-left:'+(-1)*(show.width*(1-gs)/2)+'px;float:left;'+
                        '-webkit-transform: scale('+gs+');'+
                        '-moz-transform: scale('+gs+');'+
                        '-o-transform: scale('+gs+');'+
                        'transform: scale('+gs+');'+
                        '}', end);
  end++;
  s.insertRule('.expose {width:'+show.width*gs+'px;height:'+show.height*gs+'px;'+
                     'overflow:hidden;margin:20px;float:left;position:relative;}', end);

  end++;
  for(var i=0; i < info.styles.length; i++, end++) {
    s.insertRule(info.styles[i], end);
  }
}
Show.prototype.max_scale = function(buffer) {
  buffer = buffer || 0.85;
  var width_scale = ((window.innerWidth*buffer) / this.width);
  var heigh_scale = ((window.innerHeight*buffer) / this.height);
  return Math.min(width_scale, heigh_scale)
}
Show.prototype.set_class_margins = function() {
  var that = this;
  that.current_scale = that.max_scale();
  that.scale_all_slides(that.current_scale);
  that.scale_code_editor();
}
Show.prototype.scale_all_slides = function(scale) {
  var that = this;
  var scale = scale || that.max_scale();
  $("#scale_slides").val(scale*100);
  that.current_scale = scale;

  that.set_slide_margins();
  that.center_current_class();
  that.scale_slide_class();
  if(that.mode['coding']) {
    that.float_current_right();
  }
}
Show.prototype.execute_all = function() {
  var show = this;
  for(var i=0; i < show.num_slides; i++) {
    show.slides[i].execute();
  }
}
Show.prototype.change_index_by_id = function(id) {
  var slide;
  var show = this;
  var i = 0;
  while(!slide && i < show.num_slides) {
    if(show.slides[i].dom_id === '#'+id) {
      slide = show.slides[i];
    }
    i++;
  }
  if(slide) {
    var new_index = $('.slide').index(slide.dom)
    var sign = new_index > slide.index ? -1 : 1
    console.log(slide, new_index, slide.index, sign);
    for(var i= new_index; i != slide.index; i+= sign) {
      console.log(show.slides[i])
      show.slides[i].index += sign;
    }
    show.slides.splice(slide.index, 1);
    show.slides.splice(new_index, 0, slide);
    slide.index = new_index;
    show.execute_all();
  } else {
    console.log('could not parse', html)
  }
}
Show.prototype.toggle_expose = function(index) {
  var show = this;
  if(show.mode['coding']) {
    show.toggle_coding_mode();
  }
  if(show.mode['expose']) {
    show.mode['expose'] = false
    $('.presentation').css('overflow', 'hidden');
    $('.gridify').addClass('slide');
    $('.slide').removeClass('gridify');
    $('.slide').unwrap('<div class="expose" />');
    $('.slide').css({opacity:'', right:'', top:''})
    $( ".slides" ).sortable({ disabled: true });
    show.set_current_to_index(index || 0);
  } else {
    show.mode['expose'] = true;
    $('.presentation').css('overflow', 'auto');
    $('.slide').addClass('gridify');
    $('.slide').removeClass('far-past past current future far-future');
    $('.slide').wrap('<div class="expose" />');
    $('.slide').css({opacity:1, right:'auto', top:'auto'})
    $('.slides').sortable({ 
      disabled: false,
      update: function(event, ui) {
        console.log(event, ui);
        show.change_index_by_id(ui.item[0].firstChild.id);
      }
    });
  }
}
Show.prototype.toggle_reduced = function(factor) {
  var that = this;

  if(that.mode['reduced']) {
    that.mode['reduced'] = false;
  } else {
    that.mode['reduced'] = true;
  }

  that.scale_slide_class(); 
}
Show.prototype.float_current_right = function() {
  var that = this;
  var s = document.styleSheets[0];
  var margin_right = (-1)*(that.width*(1-that.current_scale)/2);
  
  s.deleteRule(4); 
  s.insertRule('.current {right: 0px !important; margin-right:'+margin_right+'px;opacity: 1.0; z-index: 9999;'+
               '-webkit-transform: scale('+that.current_scale+') !important;'+
               '-moz-transform:scale('+that.current_scale+') !important;'+
               '-o-transform:scale('+that.current_scale+') !important;'+
               'transform:scale('+that.current_scale+') !important;'+
               '}', 4);
  that.scale_code_editor(); 
}
Show.prototype.scale_code_editor = function() {
  var that = this;
  var s = document.styleSheets[0];
  var editor_height = window.innerHeight-40;
  var editor_width = window.innerWidth -5 - that.current_scale*that.width;
  if(!!s.cssRules[6] && s.cssRules[6].selectorText === '.CodeMirror') {
    s.deleteRule(6);
    s.deleteRule(6);
  }
  s.insertRule('.CodeMirror {width: '+editor_width+'px;'+
                            'height:'+editor_height+'px;'+
                            'margin-top:'+editor_height*(-0.5)+'px;}', 6)
  s.insertRule('.CodeMirror-scroll {height:'+editor_height+'px !important;}', 7)
}
Show.prototype.set_slide_margins = function() {
  var that = this;
  var s = document.styleSheets[0];
  var width = that.width;
  var margin = 20;
  var scale = that.current_scale;
  if(!!s.cssRules[0] && s.cssRules[0].selectorText === '.far-past') {
    s.deleteRule(0); 
    s.deleteRule(0); 
    s.deleteRule(0); 
    s.deleteRule(0); 
  }
  s.insertRule('.far-past {margin-right: '+(width*(1.5) + margin*2 - width*2*(1-scale))+'px;}', 0)
  s.insertRule('.past {margin-right: '+(width*(0.5) + margin - width*(1-scale))+'px;}', 1)
  s.insertRule('.future {margin-right: '+(width*(-1.5) - margin + width*(1-scale))+'px;}', 2)
  s.insertRule('.far-future {margin-right: '+(width*(-2.5) - margin*2 + width*2*(1-scale))+'px;}', 3)
}
Show.prototype.scale_slide_class = function() {
  var that = this;
  var s = document.styleSheets[0];
  var scale = that.current_scale;
  if(that.mode['reduced']) {
    scale = scale*0.85;
  }
  if(!!s.cssRules[5] && s.cssRules[5].selectorText === '.slide') {
    s.deleteRule(5);
  }
  
  s.insertRule('.slide {width:'+that.width+'px;height:'+that.height+'px;margin-top:'+that.height*(-0.5)+'px;'+
                '-webkit-transform: scale('+scale+');'+
                '-moz-transform:scale('+scale+');'+
                '-o-transform:scale('+scale+');'+
                'transform:scale('+scale+');'+
                '}', 5);
}
Show.prototype.center_current_class = function() {
  var that = this;
  var s = document.styleSheets[0];
  if(!!s.cssRules[4] && s.cssRules[4].selectorText === '.current') {
    s.deleteRule(4); 
  }
  s.insertRule('.current {margin-right: '+that.width*(-0.5)+'px;'+
               '-webkit-transform:scale('+that.current_scale+') !important;'+
               '-moz-transform:scale('+that.current_scale+') !important;'+
               '-o-transform:scale('+that.current_scale+') !important;'+
               'transform:scale('+that.current_scale+') !important;'+
               '}', 4);
}
Show.prototype.toggle_coding_mode = function() {
  var that = this;
  if(that.mode['coding']) {
    that.mode['coding'] = false;
    $('.CodeMirror').hide();
    that.center_current_class();
  } else {
    that.mode['coding'] = true;
    that.float_current_right();
    $('.CodeMirror').show();
    code_editor.setValue(that.current.scripts);
  }
}
Show.prototype.set_current_to_index = function(index) {
  var that = this;
  if(that.valid_index(index)) {
    var classes = 'far-past past current future far-future';
    that.slides[index].change_classes(classes, 'current');
    that.current = that.slides[index];
    if(that.valid_index(index-1)) {
      that.slides[index-1].change_classes(classes, 'past');
      if(that.valid_index(index-2)) {
        for(var i=0; i <= index-2; i++) {
          that.slides[i].change_classes(classes, 'far-past')
        }
      }
    }
    if(that.valid_index(index+1)) {
      that.slides[index+1].change_classes(classes, 'future');
      if(that.valid_index(index+2)) {
        for(var i = index+2; i < that.num_slides; i++) {
          that.slides[i].change_classes(classes, 'far-future');
        }
      }
    }
  }
}
Show.prototype.initialize_slides = function() {
  var that = this;
  that.num_slides = that.slides.length;
  that.slides[0].dom.addClass('current');
  that.current = that.slides[0];
  that.current.execute();
  if(that.slides[1]) {
    that.slides[1].dom.addClass('future');
    that.slides[1].execute();
    if(that.slides[2]) {
      for(var i=2; i < that.num_slides; i++) {
        that.slides[i].dom.addClass('far-future');
        that.slides[i].execute();
      }
    }
  }
}
Show.prototype.move = function(direction, index) {
  var show = this;
  if(!show.mode['expose']) {
    switch(direction) {
      case 'prev': show.prev(); break;
      case 'next': show.next(); break;
      case 'set' : show.set_current_to_index(index || 0); break;
    }
  }
}
Show.prototype.next = function() {
  var that = this;
  var id = that.current.index;
  if(that.valid_index(id+1)) {
    that.slides[id+1].change_classes('future',  'current');
    that.slides[id  ].change_classes('current', 'past');
    if(that.valid_index(id-1)) { that.slides[id-1].change_classes('past',   'far-past') }
    if(that.valid_index(id+2)) { that.slides[id+2].change_classes('far-future', 'future') }
    that.current = that.slides[id+1];
    that.current.execute();
  }
}
Show.prototype.prev = function() {
  var that = this;
  var id = that.current.index;
  if(that.valid_index(id-1)) {
    that.slides[id  ].change_classes('current', 'future');
    that.slides[id-1].change_classes('past',  'current');
    if(that.valid_index(id+1)) { that.slides[id+1].change_classes('future',   'far-future') }
    if(that.valid_index(id-2)) { that.slides[id-2].change_classes('far-past', 'past') }
    that.current = that.slides[id-1];
    that.current.execute();
  }
}
Show.prototype.save_current = function() {
  this.current.scripts = code_editor.getValue();
  this.current.save();
  this.current.execute();
}
Show.prototype.valid_index = function(index) {
  return (index >= 0) && (index <= this.num_slides-1)
}
Show.prototype.insert_slide = function() {
  var that = this;
  $("#new_slide #insert_id").val(that.current.id);
  $.post("/slides", $("#new_slide").serialize(), function(res, text_status) {
    $($(".slide")[$(".slide").index(that.current.dom)]).after(res.slidehtml)
    var s = new Slide(that, res.slide)
    that.slides.splice(s.index, 0, s);
    that.num_slides = that.slides.length; 
    for(var i=s.index+1; i < that.num_slides; i++) {
      that.slides[i].index += 1;
    }
    s.execute();
    that.set_current_to_index(s.index);
    $("#new_slide #copy").val('');
    $("#new_slide #insert_id").val('');
  })
}
Show.prototype.duplicate_slide = function() {
  $("#new_slide #copy").val('true');
  this.insert_slide();
}
Show.prototype.append_slide = function() {
  var that = this;
  $.post("/slides", $("#new_slide").serialize(), function(res, text_status) {
    $(".slide").last().after(res.slidehtml);
    var s = new Slide(that, res.slide)
    that.slides.push(s);
    that.num_slides = that.slides.length; 
    s.execute();
    that.set_current_to_index(s.index);
  })
}
Show.prototype.append_slide = function() {

}
function Slide(show, props) {
  this.show = show;
  this.id = props.id;
  this.dom_id = '#slide_'+props.id;
  this.index = props.index;
  this.scripts = props.scripts || '';
  this.styles = props.styles || '';
  this.dom = $(this.dom_id);
  //this.paper = Raphael("slide_"+this.id, show.width, show.height); 
  var that = this;
  that.dom.bind('dblclick', function() {
    if(that.dom.hasClass('gridify')) {
      that.show.toggle_expose(that.index);
    }
  });
  that.dom.click(function() {
    if(!that.dom.hasClass('gridify')) {
      that.handle_click(); 
    }
  });
  this.page = d3.select(this.dom_id).select("svg").attr("width", show.width).attr("height", show.height);

  return this;
}
Slide.prototype.handle_click = function() {
  var that = this;
  if(that.dom.hasClass('current')) {
    return false;
  } else if(that.dom.hasClass('future')) {
    that.show.next();
    return 'next';
  } else if(that.dom.hasClass('past')) {
    that.show.prev();
    return 'prev';
  } else {
    that.show.set_current_to_index(that.index);
    return 'distant';
  }
}
Slide.prototype.change_classes = function(to_remove, to_add) {
  this.dom.removeClass(to_remove).addClass(to_add);
}
Slide.prototype.save = function() {
  $("#edit_slide_"+this.id+" #slide_scripts").val(this.scripts); 
  $("#edit_slide_"+this.id).submit(); 
}
Slide.prototype.destroy = function() {
  var that = this;
  var show = that.show;
  if(show.num_slides > 1) {
    $('.destroy_slide').attr('action', '/slides/'+that.id);

    $.post("/slides/"+that.id, $(".destroy_slide").serialize(), function(res, text_status) {
      show.slides.splice(that.index, 1);
      show.num_slides += -1;
      $(that.dom_id).remove();
      for(var i=that.index; i < show.num_slides; i++) {
        show.slides[i].index += -1;
      }
      if(that.index > 0) {
        show.set_current_to_index(that.index-1)
      } else {
        show.set_current_to_index(0)
      }
    });
  }
}
Slide.prototype.execute = function() {
  var that = this;
  code_editor.setValue(that.scripts)
  $(that.dom_id+' svg').empty();
  var scale = that.show.current_scale;
  clearInterval(that.show.interval);
  try {
    (new Function("page", "slide", "show", "scale", that.show.scripts+that.scripts ) ).call(that.page, that.page, that, that.show, scale);
  } catch (e) {
    alert(e.message || e);
  }
}
function create_slideshow(info) {
  var show = new Show(info);
  var slides = []
  for(var i=0; i < info.ordered_slides.length; i++) {
    slides.push(new Slide(show, info.ordered_slides[i]));
  }
  show.slides = slides; //.sort(function(a, b) {return (a.index - b.index) });
  show.initialize_slides();
  //show.set_class_margins();
  $("#insert_after_currect").click(function() {
    show.insert_slide();
  });
  $("#duplicate_current").click(function() {
    show.duplicate_slide();
  });
  $("#delete_current").click(function() {
    show.current.destroy();
  });
  $(document).keydown( function(e) {
    if( $(e.srcElement).parents().hasClass('CodeMirror')) {
      if(e.keyCode == 27) {
      //$(".CodeMirror").hide();
        //show.toggle_coding_mode();
      } else if(e.keyCode === 'S'.charCodeAt(0) && e.ctrlKey) {
        show.save_current();
      }
    } else {
      handleKeys(e, show);
    }
  })
  return show;
}
function handleKeys(e, show) {
 switch (e.keyCode) {
   case 37: // left arrow
     show.move('prev'); break;
   case 39: // right arrow
     show.move('next'); break;
   case 72: // H 
     show.move('prev'); break;
   case 74: // J 
     show.scale_all_slides(show.current_scale*0.9); break;
   case 75: // K 
     show.scale_all_slides(show.current_scale*1.1); break;
   case 76: // L 
     show.move('next'); break;
   case 80: // P 
     //presentationMode(); break;
     show.toggle_reduced(); break;
   case 69: // E
     //editingMode(); break;
   case 65: // A
     show.toggle_coding_mode(); break;
   case 83: // S
     show.toggle_expose(); break;
  }
}
function zoom_slides() {
  var scale = $("#scale_slides").val()/100;
  if(slideshow) {
    slideshow.scale_all_slides(scale); 
  }
}
