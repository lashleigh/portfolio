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
    self.reload
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
    base = Show.find_by_title('base hack, think of something better soon')
    self.assign(:styles => base.styles, :scripts => base.scripts)
  end
end
