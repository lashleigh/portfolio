function Show(info) {
  this.id     = info.id;
  this.width  = info.width;
  this.height = info.height;
  this.current= 0;
  this.slides = [];
  
  return this;
}
Show.prototype.initialize_slides = function() {
  var that = this;
  that.slides[0].dom.addClass('current');
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
  var id = that.current;
  if(that.valid_index(id+1)) {
    that.slides[id  ].change_classes('current', 'past');
    that.slides[id+1].change_classes('future',  'current');
    if(that.valid_index(id-1)) { that.slides[id-1].change_classes('past',   'far-past') }
    if(that.valid_index(id+2)) { that.slides[id+2].change_classes('far-future', 'future') }
    that.current++;
    console.log(that.current);
  }
}
Show.prototype.prev = function() {
  var that = this;
  var id = that.current;
  if(that.valid_index(id-1)) {
    that.slides[id  ].change_classes('current', 'future');
    that.slides[id-1].change_classes('past',  'current');
    if(that.valid_index(id+1)) { that.slides[id+1].change_classes('future',   'far-future') }
    if(that.valid_index(id-2)) { that.slides[id-2].change_classes('far-past', 'past') }
    that.current--;
    console.log(that.current);
  }
}
Show.prototype.valid_index = function(index) {
  return (index >= 0) && (index <= this.slides.length-1)
}
function Slide(show, props) {
  this.show = show;
  this.id = props.id;
  this.index = props.index;
  this.scripts = props.scripts;
  this.styles = props.styles;
  this.dom = $('#'+props.id);

  return this;
}
Slide.prototype.change_classes = function(to_remove, to_add) {
  this.dom.removeClass(to_remove).addClass(to_add);
}

function create_slideshow(info) {
  show = new Show(info)
  for(var i=0; i < info.slides.length; i++) {
    show.slides.push(new Slide(show, info.slides[i]));
  }
  show.initialize_slides();
  return show;
}
