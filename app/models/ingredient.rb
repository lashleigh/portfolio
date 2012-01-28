class Ingredient
  include MongoMapper::Document

  key :name, String, :required => true
  many :parts

end
