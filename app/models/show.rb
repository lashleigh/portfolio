class Show
  include MongoMapper::Document
  before_create :add_default_style

  key :title, String
  key :width, Integer, :default => 1024, :required => true
  key :height, Integer, :default => 768, :required => true
  key :version, Integer, :default => 0
  key :scripts, String, :default => ''
  key :styles, String, :default => ''
  timestamps!
  
  many :slides
  belongs_to :user

  def self.by_uid_and_title(uid, title) 
    Show.all.select {|s| s.user.uid === uid and s.title === title}
  end
  def ordered_slides
    slides.sort(:index).all
  end
  def new_slide(scripts = nil)
    Slide.create!(:index => slides.length, :show => self, :scripts => scripts)
  end
 
  def self.duplicate_show(show_id)
    to_copy = Show.find(show_id)
    if to_copy
      new = Show.create!(:styles => to_copy.styles, :scripts => to_copy.scripts, 
                         :height => to_copy.height, :width => to_copy.width)
      to_copy.ordered_slides.each { |s| new.new_slide(s.scripts) }
      return new
    else
      return false
    end
  end
  def delete_index(index) 
    max_index = slides.length-1
    if index >= 0 and index <= max_index 
      affected = slides.in_range(index+1, max_index)
      affected.each {|s| s.decrement(:index => 1) }
    end
  end
  def clean_slide_order
    self.ordered_slides.each_with_index do |s, i|
      if s.index != i
        s.index = i
        s.save
      end
    end
  end
  def change_slide_order(slide, index)
    if slide and slide.index != index
      if index > slide.index
        affected = slides.in_range(slide.index+1, index).all
        affected.each {|s| s.decrement(:index => 1) }
      else 
        affected = slides.in_range(index, slide.index-1).all
        affected.each {|s| s.increment(:index => 1) }
      end
      slide.set(:index => index) 
    end
  end
  def base_scripts
    "var t_header = {\r\n  'x':0,\r\n  'y':0,\r\n  'dy': '20px',\r\n  'dx': '20px',\r\n  'dominant-baseline': 'hanging',\r\n  'font-size': '86px',\r\n  'font-family': 'Helvetica'\r\n};\r\nvar header = page.append('svg:text')\r\n  .attr(t_header);\r\n\r\nvar counter = page.append('svg:text')\r\n    .attr('x', show.width/2)\r\n    .attr('y', show.height)\r\n    .attr(\"text-anchor\", \"middle\")\r\n    .attr('dy', '-26px')\r\n    .attr('fill', '#000')\r\n    .attr('font-size', '16px')\r\n    .attr('dominant-baseline', 'hanging')\r\n    .text(slide.index+1+'/'+show.num_slides);\r\n"
  end
  def base_style
    "// Do not change @width or @height\r\n@margin: 20px;\r\n@grid_scale: 0.22;\r\n\r\n.scale (@scale) {\r\n  -webkit-transform: scale(@scale);\r\n  -moz-transform:scale(@scale);\r\n  -o-transform:scale(@scale);\r\n  transform:scale(@scale);\r\n}\r\n.linear_gradient(@start: top, @from: #fff, @to: #bbb) {\r\n  background: -webkit-linear-gradient(@start, @from, @to);  \r\n  background: -moz-linear-gradient(@start, @from, @to);  \r\n  background: -ms-linear-gradient(@start, @from, @to); \r\n  background: -o-linear-gradient(@start, @from, @to);\r\n  background: linear-gradient(@start, @from, @to);\r\n}\r\n.radial_gradient(@from: #fff, @to: #bbb) {\r\n  background: -webkit-radial-gradient(@from, @to);  \r\n  background: -moz-radial-gradient(@from, @to);  \r\n  background: -ms-radial-gradient(@from, @to); \r\n  background: -o-radial-gradient(@from, @to);\r\n  background: radial-gradient(@from, @to);\r\n}\r\n.presentation {\r\n  .radial_gradient(#121, #000);\r\n  position: absolute;\r\n  height: 100%;\r\n  width: 100%;\r\n  left: 0px;\r\n  top: 0px;\r\n  display: block;\r\n  overflow: hidden;\r\n}\r\n\r\n.slide:nth-child(even) {\r\n  border-radius: 30px 0;\r\n}\r\n.slide:nth-child(odd) {\r\n  border-radius: 0 30px;\r\n}\r\n.slide {\r\n  .scale(@current_scale);\r\n  width: @width;\r\n  height: @height;\r\n  margin-top: @height*(-0.5);\r\n  position: absolute;\r\n  top: 50%; \r\n  right: 50%;\r\n  opacity: .45;\r\n  box-shadow: 0px 0px 9px black;\r\n  background: white; \r\n  display: block;\r\n  //overflow:hidden;\r\n  .linear_gradient();\r\n}\r\n.slide.far-past {\r\n  margin-right: @width*1.5 + @margin*2 - @width*2*(1-@current_scale);\r\n}\r\n.slide.past {\r\n  margin-right: @width*0.5 + @margin - @width*(1-@current_scale);\r\n}\r\n.slide.current {\r\n  opacity: 1.0;\r\n  z-index: 1;\r\n  margin-right: @width*(-0.5);\r\n}\r\n.slide.future {\r\n  margin-right: @width*(-1.5) - @margin + @width*(1-@current_scale);\r\n}\r\n.slide.far-future {\r\n  margin-right: @width*(-2.5) - @margin*2 + @width*2*(1-@current_scale);\r\n}\r\n.gridify .slide {\r\n  .scale(@grid_scale);\r\n  margin-top: -@height*(1-@grid_scale)/2;\r\n  margin-left: -@width*(1-@grid_scale)/2;\r\n  float: left;\r\n  opacity: 1.0;\r\n  top: auto;\r\n  right: auto;\r\n}\r\n.reduced:not(.gridify) .slide:not(.current) {\r\n  .scale(0.9*@current_scale);  \r\n}\r\n.editing .current {\r\n  right: 0px;\r\n  margin-right: -@width*(1-@current_scale)/2;\r\n}\r\n.expose {\r\n  width: @width*@grid_scale;\r\n  height: @height*@grid_scale;\r\n  overflow: hidden;\r\n  margin: 5px;\r\n  float: left;\r\n  position: relative;\r\n}\r\n.show_editor_wrap, .show_editor {\r\n  width: 550px;\r\n}"
  end

  private
  def add_default_style
    self.styles = self.base_style
    self.scripts = self.base_scripts
    self.new_slide
  end
end
