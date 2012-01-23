class Recipe
  include MongoMapper::Document

  key :title, String
  many :ingredients
  timestamps!

end
