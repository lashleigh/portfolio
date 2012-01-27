class Recipe
  include MongoMapper::Document

  key :title, String
  many :ingredients
  timestamps!

  def splice(obj, new_index)
    self.ingredients.delete(obj)
    self.ingredients.insert(new_index, obj)
  end
  def splice_by_id(ingredient_id, new_index)
    ingredient = self.ingredients.find(ingredient_id)
    self.splice(ingredient, new_index)
  end
end
