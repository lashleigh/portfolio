class Ingredient
  include MongoMapper::EmbeddedDocument

  key :amount, Float, :required => true
  key :name, String, :required => true
  key :order, Integer, :required => true

end
