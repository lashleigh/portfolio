class Slide
  include MongoMapper::Document

  key :index, Integer
  key :scripts, String
  key :data, String
  timestamps!
  belongs_to :show

  scope :in_range, lambda {|low, high| where(:index.gte => low, :index.lte => high) }

end
