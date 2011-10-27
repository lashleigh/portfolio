class Show
  include MongoMapper::Document

  key :title, String
  key :width, Integer, :default => 1024
  key :height, Integer, :default => 768
  key :version, Integer, :default => 0
  key :scripts, String, :default => ''
  key :styles, Array
  timestamps!
  
  many :slides
  belongs_to :user

  def styles=(x)
    if String === x and !x.blank?
      super(ActiveSupport::JSON.decode(x))
    else
      super(x)
    end
  end

  def ordered_slides
    slides.sort(:index).all
  end
  def new_slide(scripts = nil, styles = nil)
    self.reload
    Slide.create!(:index => slides.length, :show => self)
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
end
