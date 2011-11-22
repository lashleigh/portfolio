function Show(info) {
  this.id     = info.id;
  this.width  = info.width;
  this.height = info.height;
  this.title  = info.title;
  this.scripts = info.scripts;
  this.styles = info.styles;
  this.current;
  this.slides = [];
  this.num_slides;
  this.mode = {'reduced':false, 'coding':false}; //coding, expose, edit, presentation
  this.current_scale = this.max_scale();
  this.interval;
  this.scale_all_slides();
  
  return this;
}
Show.prototype.max_scale = function(buffer) {
  buffer = buffer || 0.85;
  var width_scale = ((window.innerWidth*buffer) / this.width);
  var heigh_scale = ((window.innerHeight*buffer) / this.height);
  return Math.min(width_scale, heigh_scale)
}
Show.prototype.fire_message = function(msg) {
  $('.presentation #message').text(msg); //.fadeOut(2500);
}
Show.prototype.scale_all_slides = function(scale) {
  var that = this;
  var scale = scale || that.max_scale();
  $("#scale_slides").val(scale*100);
  that.current_scale = scale;

  that.update_custom_style();
  var editor_height = window.innerHeight-60;
  var editor_width = window.innerWidth -15 - that.current_scale*that.width;
  $('#slide_js_editor').css('height', editor_height+'px')
                       .css('margin-top', editor_height*(-0.5)+'px')
                       .css('width', editor_width+'px');

  $('#slide_js_editor .CodeMirror-scroll').css('height', editor_height+'px !important');
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
    for(var i= new_index; i != slide.index; i+= sign) {
      show.slides[i].index += sign;
    }
    slide.change_index(new_index);
  } else {
  }
}
Show.prototype.toggle_expose = function(index) {
  var show = this;
  if(show.mode['coding']) {
    show.toggle_coding_mode();
  }
  if(show.mode['expose']) {
    show.mode['expose'] = false;
    show.close_editor();
    $('.presentation').css('overflow', 'hidden');
    $('.slides').removeClass('gridify');
    $('.slide').unwrap('<div class="expose" />');
    $('.slides').sortable({ disabled: true });
    $('#slide_options').show();
    show.set_current_to_index(index || 0);
  } else {
    show.mode['expose'] = true;
    $('.presentation').css('overflow', 'auto');
    $('.slides').addClass('gridify');
    $('.slide').removeClass('far-past past current future far-future');
    $('.slide').wrap('<div class="expose" />');
    $('#slide_options').hide();
    $('.slides').sortable({ 
      disabled: false,
      update: function(event, ui) {
        show.change_index_by_id(ui.item[0].firstChild.id);
      }
    });
  }
}
Show.prototype.toggle_reduced = function(factor) {
  var that = this;

  if(that.mode['reduced']) {
    that.mode['reduced'] = false;
    $('.slides').removeClass('reduced');
  } else {
    that.mode['reduced'] = true;
    $('.slides').addClass('reduced');
  }
}
Show.prototype.toggle_coding_mode = function() {
  var that = this;
  if(that.mode['coding']) {
    that.mode['coding'] = false;
    $('#slide_js_editor').hide();
    $('.slides').removeClass('editing');
    $('.presentation').after($('#slide_js_editor'))
  } else if(!that.mode['expose']) {
    that.mode['coding'] = true;
    $('#slide_js_editor').show();
    $('.slides').addClass('editing');
    code_editor.setValue(that.current.scripts);
    $('.presentation').before($('#slide_js_editor'))
  }
}
Show.prototype.save_scripts = function() {
  var show = this;
  // TODO Make sure the js runs without errors before saving
  $('#show_scripts').val(show_js_editor.getValue());

  $.post('/shows/'+show.id, $('.edit_show').serialize() , function(res, text_status) {
    if(text_status === 'success') {
      show.scripts = show_js_editor.getValue();
      show.execute_all();
    } else {
      console.log(res, text_status);
    }
  });
}
Show.prototype.update_custom_style = function() {
  var show = this;
  var css = show.parse_style(this.styles);
  if(css) {
    if(!$('head style#show_styles')[0]) {
      var head = document.getElementsByTagName("head")[0];
      var style = document.createElement( "style" );
      var css = show.parse_style(show.styles);
      style.type = "text/css";
      style.media = "screen";
      style.id = "show_styles";
      $(style).text(css);
      head.appendChild(style);
    }
    $('head style#show_styles').text(css);
  }
}
Show.prototype.parse_style = function(raw_less) {
  var parser = new(less.Parser);
  var css;
  var extras = '@width: '+this.width+'px;'+
               '@height: '+this.height+'px;'+
               '@current_scale: '+this.current_scale+';';
  parser.parse(extras+raw_less, function (err, tree) {
    if (err) { 
      console.log(tree);
      console.error(err);
      css = false;
    } else {
      css = tree.toCSS();
    }
  });
  if(css === '') { css = ' '; }
  return css;
}
Show.prototype.save_styles = function() {
  var show = this;
  var raw_less = show_style_editor.getValue();
  var css = show.parse_style(raw_less);
  if(css) {
    $('.edit_show #show_styles').val(raw_less);
    $.post('/shows/'+show.id, $('.edit_show').serialize() , function(res, text_status) {
      if(text_status === 'success') {
      show.styles = raw_less;
        $('head style#show_styles').text(css);
      } else {
        console.log(res, text_status);
      }
    });
  }
}
Show.prototype.save_from_editor = function() {
  var show = this;
  var css;
  if(show.mode['show_editor']) {
    if(show.mode['show_editor'] === '#show_style_editor') {
      show.save_styles();
    } else {
      show.save_scripts();
    }
  } else {
    console.log('show editor was not open so could not save')
  }
  return css;
}
Show.prototype.open_editor = function(which) {
  var that = this;
  if(!that.mode['expose']) {
    that.toggle_expose();
  }
  if(which === '#show_js_editor') {
    $(".show_editor_wrap").append($("#show_style_editor"))
  } else {
    $(".show_editor_wrap").append($("#show_js_editor"))
  }
  $(which).show();
  $('.show_editor_wrap').show();
}
Show.prototype.close_editor = function() {
  $('.show_editor_wrap').hide();
  $('.show_editor').hide();
  this.mode['show_editor'] = false;
}
Show.prototype.toggle_editor = function(which) {
  var that = this;
  if(that.mode['show_editor']) {
    if(that.mode['show_editor'] === which) {
      that.close_editor();
    } else {
      that.close_editor();
      that.mode['show_editor'] = which;
      that.open_editor(which);
    }
  } else {
    that.mode['show_editor'] = which;
    that.open_editor(which);
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
  if(that.slides[1]) {
    that.slides[1].dom.addClass('future');
    if(that.slides[2]) {
      for(var i=2; i < that.num_slides; i++) {
        that.slides[i].dom.addClass('far-future');
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
  this.data = props.data ? JSON.parse(props.data) : {};
  this.dom = $(this.dom_id);
  //this.paper = Raphael("slide_"+this.id, show.width, show.height); 
  var that = this;
  that.dom.bind('dblclick', function(e) {
    if(that.show.mode['expose']) {
      e.stopPropagation();
      that.show.toggle_expose(that.index);
    }
  });
  that.dom.click(function() {
    if(!that.show.mode['expose']) {
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
Slide.prototype.change_index = function(new_index) {
  var slide = this;
  var edit_id = "#edit_slide_"+slide.id;
  $(edit_id+" #slide_index").val(new_index); 
  slide.show.fire_message('saving...');
  $.post("/slides/"+slide.id, $(edit_id).serialize(), function(res, text_status) {
    slide.show.fire_message(text_status);
    if(text_status === 'success') {
      slide.show.slides.splice(slide.index, 1);
      slide.show.slides.splice(new_index, 0, slide);
      slide.index = new_index;
      slide.show.execute_all();
    } else {
      console.log('falied to change index', res, text_status);
    }
  });
}
Slide.prototype.save = function() {
  $("#edit_slide_"+this.id+" #slide_scripts").val(this.scripts); 
  $("#edit_slide_"+this.id+" #slide_data").val(JSON.stringify(this.data)); 
  $("#edit_slide_"+this.id).submit(); 
}
Slide.prototype.destroy = function() {
  var that = this;
  var show = that.show;
  show.fire_message('deleting...');
  if(show.num_slides > 1) {
    $('.destroy_slide').attr('action', '/slides/'+that.id);

    $.post("/slides/"+that.id, $(".destroy_slide").serialize(), function(res, text_status) {
      show.fire_message(text_status);
      if(text_status === 'success') {
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
      } else {
        console.log('failed to destroy', res, text_status)
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
    (new Function("page", "slide", "show", "scale", that.show.scripts+'\n'+that.scripts ) ).call(that.page, that.page, that, that.show, scale);
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
  show.slides = slides; 
  show.initialize_slides();
  show.execute_all();
  // TODO Keeping the slides invisible at first makes it less jarring
  $('.slides').css('display', 'block');
  $("#insert_after_currect").click(function() {
    show.insert_slide();
  });
  $("#duplicate_current").click(function() {
    show.duplicate_slide();
  });
  $("#delete_current").click(function() {
    show.current.destroy();
  });
  $('#show_style').click(function() {
    show.toggle_editor('#show_style_editor');
  })
  $('#show_js').click(function() {
    show.toggle_editor('#show_js_editor');
  })
  $(document).keydown( function(e) {
    if(e.target.nodeName === 'TEXTAREA' || e.target.contentEditable === "true") {
    if( $(e.target).parents().hasClass('CodeMirror')) {
      if(e.keyCode == 27) {
      } else if(e.keyCode === 'S'.charCodeAt(0) && e.ctrlKey) {
        if(show.mode['coding']) {
          show.save_current();
        } else {
          show.save_from_editor();
        }
      }
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
