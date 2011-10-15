class Faq
  include MongoMapper::Document
  key :visible,       Boolean, :default => false
  key :question, String
  key :answer, String
  key :position, Integer
  timestamps!

  scope :visible, where(:visible => true)  
end
