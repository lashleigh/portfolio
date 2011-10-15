class Network
  include MongoMapper::Document
  
  key :src, String
  key :href, String
  key :title, String
  key :position, Integer
  key :which, String, :default => "primary"
  timestamps!
  
  scope :primary, where(:which => "primary")  
end
