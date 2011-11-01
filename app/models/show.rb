class Show
  include MongoMapper::Document
  before_create :add_default_style

  key :title, String
  key :width, Integer, :default => 1024
  key :height, Integer, :default => 768
  key :version, Integer, :default => 0
  key :scripts, String, :default => ''
  key :styles, String, :default => ''
  timestamps!
  
  many :slides
  belongs_to :user

  def ordered_slides
    slides.sort(:index).all
  end
  def new_slide
    self.reload
    Slide.create!(:index => slides.length, :show => self)
  end
 
  def delete_index(index) 
    max_index = slides.length-1
    if index >= 0 and index <= max_index 
      affected = slides.in_range(index+1, max_index)
      affected.each {|s| s.decrement(:index => 1) }
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

  private
  def add_default_style
    base = Show.find_by_title('Base Style')
    style = base ? base.styles : "// Don't overwrite @width or @height"
    self.assign(:styles => style)
  end
end
