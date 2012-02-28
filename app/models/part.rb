class Part
  include MongoMapper::EmbeddedDocument
  
  key :amount, Float, :required => true
  key :percent, Float, :default => 0
  key :primary, Boolean, :default => false
  belongs_to :ingredient

  def changed(params)
    
  end
end
