class Part
  include MongoMapper::EmbeddedDocument
  before_save :truncate

  key :amount, Float, :required => true
  key :percent, Float, :default => 0
  key :primary, Boolean, :default => false
  key :fixed_percent, Boolean, :default => false
  belongs_to :ingredient

  def changed(params)
    
  end
  def truncate
    self.amount = self.amount.round(2)
    self.percent = self.percent.round(2)
  end
end
