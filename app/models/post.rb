class Post
  include MongoMapper::Document
  
  key :title, String
  key :content, String
  key :visible,       Boolean, :default => false
  timestamps!
  scope :visible, where(:visible => true)  
  
  def to_param
      "#{id}-#{title.parameterize}"
  end
end
