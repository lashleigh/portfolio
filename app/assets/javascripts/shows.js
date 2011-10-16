function Show(info) {
  this.id     = info.id;
  this.width  = info.width;
  this.height = info.height;
  this.current;
  this.slides = [];
  
  return this;
}
Show.prototype.initialize_slides = function() {
  var that = this;
  that.slides[0].dom.addClass('current');
  that.current = that.slides[0];
  that.current.execute();
  if(that.slides[1]) {
    that.slides[1].dom.addClass('future');
    if(that.slides[2]) {
      for(var i=2; i < that.slides.length; i++) {
        that.slides[i].dom.addClass('far-future');
      }
    }
  }
}
Show.prototype.next = function() {
  var that = this;
  var id = that.current.index;
  if(that.valid_index(id+1)) {
    that.slides[id  ].change_classes('current', 'past');
    that.slides[id+1].change_classes('future',  'current');
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
}
Show.prototype.valid_index = function(index) {
  return (index >= 0) && (index <= this.slides.length-1)
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
  try {
    (new Function("paper", "slide", "window", "document", "$", that.scripts ) ).call(that.paper, that.paper, that.dom);
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
  show.slides = slides.sort(function(s) {return s.index });
  show.slides.sort(function(s) {return s.index})
  show.initialize_slides();
  $(document).keydown( function(e) {
    if( $(e.srcElement).parents().hasClass('CodeMirror')) {
      if(e.keyCode == 27) {
        $(".CodeMirror").hide();
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
     show.prev(); break;
   case 39: // right arrow
     show.next(); break;
   case 80: // P 
     //presentationMode(); break;
   case 69: // E
     //editingMode(); break;
   case 65: //a
     $(".CodeMirror").show(); break;
   case 83: //s
     //toggle_expose(0); break;
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

