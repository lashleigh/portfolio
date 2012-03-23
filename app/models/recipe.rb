class Recipe
  include MongoMapper::Document
  before_create :basic_parts

  key :title, String, :default => 'bread'
  key :photo, String
  many :parts
  many :notes
  timestamps!

  def stats
    starter = self.mass_of('starter')
    water = self.mass_of('water')
    flour = self.mass_of('flour')
    return {'hydration' => (100 * (starter/2 + water) / (starter/2 + flour)).round(2), 'inoculation' => (starter / 2 *100 / flour).round(2), 'flour_mass' => flour + starter/2}
  end
  def mass_of(name)
    self.parts.select {|p| p.ingredient.name == name }.map {|p| p.amount}.sum
  end

  def basic_parts
    self.parts << Part.new(:primary => true, :ingredient => Ingredient.find_or_create_by_name('starter'))
    self.parts << Part.new(:primary => true, :ingredient => Ingredient.find_or_create_by_name('flour'))
    self.parts << Part.new(:primary => true, :ingredient => Ingredient.find_or_create_by_name('water'))
    self.parts << Part.new(:primary => false, :ingredient => Ingredient.find_or_create_by_name('salt'), :percent => 2.00, :fixed_percent => true)
  end
  def basic(name)
    self.parts.select {|p| p.ingredient.name == name}[0]
  end
  def interpret(params)
    unless params[:starter].blank?
      self.basic('starter').amount = params[:starter].to_f
    end
    half_starter = self.basic('starter').amount / 2.0
    unless params[:flour_mass].blank?
      self.basic('flour').amount = params[:flour_mass].to_f - half_starter 
    end
    unless params[:hydration].blank?
      self.basic('water').amount = (self.basic('flour').amount + half_starter)*params[:hydration].to_f/100 - half_starter 
    end
    self.basic('salt').amount = 0.02 * (self.basic('flour').amount + half_starter)
  end
end
