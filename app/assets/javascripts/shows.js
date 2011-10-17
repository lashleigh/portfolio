function Show(info) {
  this.id     = info.id;
  this.width  = info.width;
  this.height = info.height;
  this.current;
  this.slides = [];
  this.num_slides;
  this.mode = {'reduced':false, 'coding':false}; //coding, expose, edit, presentation
  this.current_scale;
  
  return this;
}
Show.prototype.max_scale = function() {
  var width_scale = ((window.innerWidth-80) / this.width);
  var heigh_scale = ((window.innerHeight-80) / this.height);
  return Math.min(width_scale, heigh_scale)
}
Show.prototype.set_class_margins = function() {
  var margin = 40;
  var height = this.height;
  var width = this.width;
  var scale = this.max_scale();
  var styleSheet = document.styleSheets[0];
  this.current_scale = scale;
  $("#scale_slides").val(scale*100);

  styleSheet.insertRule('.far-past {margin-right: '+(width*(1.5) + margin*2 - width*2*(1-scale))+'px;}', 0)
  styleSheet.insertRule('.past {margin-right: '+(width*(0.5) + margin - width*(1-scale))+'px;}', 1)
  styleSheet.insertRule('.current {margin-right: '+width*(-0.5)+'px;}', 2)
  styleSheet.insertRule('.future {margin-right: '+(width*(-1.5) - margin + width*(1-scale))+'px;}', 3)
  styleSheet.insertRule('.far-future {margin-right: '+(width*(-2.5) - margin*1 + width*2*(1-scale))+'px;}', 4)
  styleSheet.insertRule('.slide {width:'+width+'px;height:'+height+'px;margin-top:'+height*(-0.5)+'px;-webkit-transform:scale('+scale+');}', 5)

  var editor_height = window.innerHeight-80;
  styleSheet.insertRule('.CodeMirror {width: '+(document.width - scale*width-5)+'px;height:'+editor_height+'px;margin-top:'+editor_height*(-0.5)+'px;}', 6)
  styleSheet.insertRule('.CodeMirror-scroll {height:'+editor_height+'px !important;}', 7)
}
Show.prototype.scale_all_slides = function(scale) {
  var that = this;
  var s = document.styleSheets[0]
  var margin = 40;
  var height = this.height;
  var width = this.width;
  var scale = scale || this.max_scale();
  var factor = 1.0; 
  if(that.mode['reduced']) {
    factor = 0.75;
  }
  this.current_scale = scale;
  s.deleteRule(0); 
  s.insertRule('.far-past {margin-right: '+(width*(1.5) + margin*2 - width*2*(1-scale))+'px;}', 0)
  s.deleteRule(1); 
  s.insertRule('.past {margin-right: '+(width*(0.5) + margin - width*(1-scale))+'px;}', 1)
  s.deleteRule(2); 
  s.insertRule('.current {margin-right: '+width*(-0.5)+'px;-webkit-transform:scale('+scale+') !important;}}', 2)
  s.deleteRule(3); 
  s.insertRule('.future {margin-right: '+(width*(-1.5) - margin + width*(1-scale))+'px;}', 3)
  s.deleteRule(4); 
  s.insertRule('.far-future {margin-right: '+(width*(-2.5) - margin*2 + width*2*(1-scale))+'px;}', 4)
  s.deleteRule(5);
  s.insertRule('.slide {width:'+that.width+'px;height:'+that.height+'px;margin-top:'+that.height*(-0.5)+'px;-webkit-transform: scale('+scale*factor+');}', 5)
  if(that.mode['coding']) {
    that.float_current_right();
  }
}
Show.prototype.toggle_reduced = function(factor) {
  var that = this;
  var s = document.styleSheets[0];
  var scale = that.current_scale;
  factor = factor || 0.75;

  if(that.mode['reduced']) {
    that.mode['reduced'] = false;
    replace_rules_with(scale, scale);
  } else {
    that.mode['reduced'] = true;
    replace_rules_with(scale, scale*factor); //'-webkit-transform: scale('+scale+');');
  }
  
  function replace_rules_with(current_scale, others_scale) {
    if(that.mode['coding']) {
      that.float_current_right();
    } else {
      s.deleteRule(2); 
      s.insertRule('.current {margin-right: '+that.width*(-0.5)+'px;-webkit-transform:scale('+current_scale+') !important;}', 2)
    }
    s.deleteRule(5);
    s.insertRule('.slide {width:'+that.width+'px;height:'+that.height+'px;margin-top:'+that.height*(-0.5)+'px;-webkit-transform: scale('+others_scale+');}', 5)
  }
}
Show.prototype.float_current_right = function() {
  var that = this;
  var s = document.styleSheets[0];
  var editor_width = document.width -5 - that.current_scale*that.width;
  var margin_right = (-1)*(that.width*(1-that.current_scale)/2);
  
  s.deleteRule(2); 
  s.insertRule('.current {right: 0px !important; margin-right:'+margin_right+'px;opacity: 1.0; z-index: 9999;-webkit-transform: scale('+that.current_scale+') !important;}}', 2)
  
  s.deleteRule(6);
  var editor_height = window.innerHeight-80;
  s.insertRule('.CodeMirror {width: '+editor_width+'px;height:'+editor_height+'px;margin-top:'+editor_height*(-0.5)+'px;}', 6)
}
Show.prototype.toggle_coding_mode = function() {
  var that = this;
  if(that.mode['coding']) {
    that.mode['coding'] = false;
    var s = document.styleSheets[0]
    if(that.mode['reduced']) {
      s.deleteRule(2); 
      s.insertRule('.current {margin-right: '+that.width*(-0.5)+'px;-webkit-transform:scale('+that.current_scale+') !important;}', 2)
    } else {
      s.deleteRule(2);
      s.insertRule('.current {margin-right: '+that.width*(-0.5)+'px;}', 2)
    }
    $('.CodeMirror').hide();
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
  that.slides[0].dom.addClass('current');
  that.current = that.slides[0];
  that.current.execute();
  that.num_slides = that.slides.length;
  if(that.slides[1]) {
    that.slides[1].dom.addClass('future');
    if(that.slides[2]) {
      for(var i=2; i < that.num_slides; i++) {
        that.slides[i].dom.addClass('far-future');
      }
    }
  }
}
Show.prototype.next = function() {
  var that = this;
  var id = that.current.index;
  console.log(id, id+1, that.valid_index(id+1));
  if(that.valid_index(id+1)) {
    that.slides[id+1].change_classes('future',  'current');
    that.slides[id  ].change_classes('current', 'past');
    if(that.valid_index(id-1)) { that.slides[id-1].change_classes('past',   'far-past') }
    if(that.valid_index(id+2)) { that.slides[id+2].change_classes('far-future', 'future') }
    if(that.current.dom.hasClass('small_float_right')) {
      that.current.change_classes('small_float_right','zoomed_in_slide');
      that.slides[id+1].change_classes('zoomed_in_slide','small_float_right');
    }
    that.current = that.slides[id+1];
    that.current.execute();
  }
}
Show.prototype.prev = function() {
  var that = this;
  var id = that.current.index;
  console.log(id, id-1, that.valid_index(id-1));
  if(that.valid_index(id-1)) {
    that.slides[id  ].change_classes('current', 'future');
    that.slides[id-1].change_classes('past',  'current');
    if(that.valid_index(id+1)) { that.slides[id+1].change_classes('future',   'far-future') }
    if(that.valid_index(id-2)) { that.slides[id-2].change_classes('far-past', 'past') }
    if(that.current.dom.hasClass('small_float_right')) {
      that.current.change_classes('small_float_right','zoomed_in_slide');
      that.slides[id-1].change_classes('zoomed_in_slide','small_float_right');
    }
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
Show.prototype.append_slide = function() {

}
function Slide(show, props) {
  this.show = show;
  this.id = props.id;
  this.index = props.index;
  this.scripts = props.scripts || '';
  this.styles = props.styles || '';
  this.dom = $('#'+props.id);
  this.paper = Raphael(this.id, show.width, show.height);

  return this;
}
Slide.prototype.change_classes = function(to_remove, to_add) {
  this.dom.removeClass(to_remove).addClass(to_add);
}
Slide.prototype.save = function() {
  $("#edit_slide_"+this.id+" #slide_scripts").val(this.scripts); 
  $("#edit_slide_"+this.id).submit(); 
}
Slide.prototype.execute = function() {
  var that = this;
  code_editor.setValue(that.scripts)
  that.paper.clear();
  var scale = 1.0;
  try {
    (new Function("paper", "slide", "show", "scale", "window", "document", "$", that.scripts ) ).call(that.paper, that.paper, that.dom, that.show, scale);
  } catch (e) {
    alert(e.message || e);
  }
}
Slide.prototype.scale = function(scale) {

}
function create_slideshow(info) {
  var show = new Show(info);
  var slides = []
  for(var i=0; i < info.slides.length; i++) {
    slides.push(new Slide(show, info.slides[i]));
    slides[i].execute();
  }
  show.slides = slides.sort(function(a, b) {return (a.index - b.index) });
  show.initialize_slides();
  $(document).keydown( function(e) {
    if( $(e.srcElement).parents().hasClass('CodeMirror')) {
      if(e.keyCode == 27) {
      //$(".CodeMirror").hide();
        show.toggle_coding_mode();
      } 
    } else {
      handleKeys(e, show);
    }
  })
  show.set_class_margins();
  return show;
}
function handleKeys(e, show) {
 switch (e.keyCode) {
   case 37: // left arrow
     show.prev(); break;
   case 39: // right arrow
     show.next(); break;
   case 80: // P 
     //presentationMode(); break;
     show.toggle_reduced(); break;
   case 69: // E
     //editingMode(); break;
   case 65: //a
     show.toggle_coding_mode(); break;
   case 83: //s
     //toggle_expose(0); break;
  }
}
function zoom_slides() {
  var scale = $("#scale_slides").val()/100;
  if(slideshow) {
    slideshow.scale_all_slides(scale); 
  }
}
/*$(document).keydown( function(e) {
  if( $(e.srcElement).hasClass("edit_area") && $(".edit_area").is(":visible")) {
    if(e.keyCode == 27) {
      var id = $($(e.srcElement).parent()).attr("id");
      $("#"+id+" .edit_area").focusout();
    }
  } else if( $(".presentation").hasClass("grid_layout")) {
      if(e.keyCode == 83) { toggle_expose(0); }
    } else {
    handleKeys(e);
  }
}, false);*/

