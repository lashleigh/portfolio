class Ingredient
  include MongoMapper::Document

  key :name, String, :required => true
  key :category, String
  many :parts

  def self.autocomplete_list
    all.map {|i| {'label'=> i.name, 'value' => i.id.as_json} }
  end
end
