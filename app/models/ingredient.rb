class Ingredient
  include MongoMapper::Document

  key :name, String, :required => true
  key :category, String, :required => true, :default => 'other', :in => ['flour', 'water', 'salt', 'other']

  def self.autocomplete_list
    all.map {|i| {'label'=> i.name, 'value' => i.id.as_json, 'category' => i.category} }
  end
end
