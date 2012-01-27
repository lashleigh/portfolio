class Ingredient
  include MongoMapper::EmbeddedDocument

  key :amount, Float, :required => true
  key :name, String, :required => true
  key :order, Integer, :required => true
  key :unit, String, :in => ['g', 'oz', 'cup', 'tsp', 'Tbsp']

  def ordered
  end
end
