class Show
  include MongoMapper::Document

  key :title, String
  key :width, Integer, :default => 1024
  key :height, Integer, :default => 768
  key :version, Integer, :default => 0
  key :scripts, String
  key :styles, String
  timestamps!
  
  many :slides
  belongs_to :user

  def ordered_slides
    slides.sort(:index).all
  end
  def new_slide(scripts = nil, styles = nil)
    Slide.create!(:index => slides.length, :show => self)
  end
  def change_slide_order(slide_id, index)
    slide = Slide.find(slide_id)
    if slide and slide.index != index
      if index > slide.index
        affected = slides.in_range(slide.index+1, index).all
        affected.each {|s| s.decrement(:index => 1) }
        slide.increment(:index => 1) 
      else 
        affected = slides.in_range(index, slide.index-1).all
        affected.each {|s| s.increment(:index => 1) }
        slide.decrement(:index => 1) 
      end
    end
  end
end