class Part
  include MongoMapper::EmbeddedDocument

  key :amount, Float, :required => true
  key :order, Integer, :required => true
  key :unit, String, :in => ['g', 'oz', 'cup', 'tsp', 'Tbsp']
  belongs_to :ingredient

end
