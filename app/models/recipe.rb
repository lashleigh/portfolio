class Recipe
  include MongoMapper::Document
  before_save :recalc_percent
  before_create :basic_parts

  key :title, String, :default => 'bread'
  many :parts
  timestamps!

  def splice(obj, new_index)
    self.ingredients.delete(obj)
    self.ingredients.insert(new_index, obj)
  end
  def splice_by_id(ingredient_id, new_index)
    ingredient = self.ingredients.find(ingredient_id)
    self.splice(ingredient, new_index)
  end
  def recalc_percent
    flour_weight = parts.map {|p| p.ingredient.name == 'flour' ? p.amount : 0 }.sum
    if flour_weight > 0
      #parts.each do |p| 
      #  puts p.amount
      #  if p.changed? or !p.percent
      #    p.percent = p.amount / flour_weight 
      #    p.save
      #  end
      #end
    end
  end
  def basic_parts
    self.parts << Part.new(:amount => 30,  :unit => 'g', :percent => 5.66, :primary => true, :ingredient => Ingredient.find_or_create_by_name('starter'))
    self.parts << Part.new(:amount => 250, :unit => 'g', :percent => 94.3, :primary => true, :ingredient => Ingredient.find_or_create_by_name('flour'))
    self.parts << Part.new(:amount => 185, :unit => 'g', :percent => 69.8, :primary => true, :ingredient => Ingredient.find_or_create_by_name('water'))
    self.parts << Part.new(:amount => 6,   :unit => 'g', :percent => 2.26, :primary => false, :ingredient => Ingredient.find_or_create_by_name('salt'))
  end
  def basic(name)
    self.parts.select {|p| p.ingredient.name == name}[0]
  end
  def interpret(params)
    unless params[:starter].blank?
      self.basic('starter').amount = params[:starter].to_f
      puts 'starter'
    end
    half_starter = self.basic('starter').amount / 2.0
    unless params[:flour_mass].blank?
      self.basic('flour').amount = params[:flour_mass].to_f - half_starter 
      puts 'flour'
    end
    unless params[:hydration].blank?
      self.basic('water').amount = (self.basic('flour').amount + half_starter)*params[:hydration].to_f/100 - half_starter 
      puts 'water'
    end
  end
end
