class PartsController < ApplicationController
  def new
    @recipe = Recipe.find(params[:recipe_id])
    @part = Part.new
    render :json => @part
  end

  def create
    @recipe = Recipe.find(params[:recipe_id])
    if params[:ingredient_id].blank?
      ingredient = Ingredient.create!(:name => params[:ingredient][:name])
      @part = Part.new(:amount => params[:amount], :ingredient => ingredient, :unit => params[:unit])
      @recipe.parts.push(@part)  
    else
      @part = Part.new(:amount => params[:amount], :ingredient_id => params[:ingredient_id], :unit => params[:unit])
      @recipe.parts.push(@part)  
    end
    
    if @recipe.save
      render :json => @part
    else
      render :json => {'message' => 'failed to save'}
    end
  end

  def update
    @recipe = Recipe.find(params[:recipe_id])
    @part = @recipe.parts.find(params[:id])
    @ingredient = Ingredient.find(params[:ingredient_id])
    attrs = params.select {|p| @part.attributes.keys.include? p}
    if @ingredient.name != params[:ingredient][:name]
      attrs[:ingredient_id] = Ingredient.create!(:name => params[:ingredient][:name]).id
    end
    @part.update_attributes(attrs) 

    if @recipe.save
      render :json => @part
    else
      render :json => {'message' => 'failed to save'}
    end
  end

  def destroy
    @recipe = Recipe.find(params[:recipe_id])
    @recipe.parts.delete_if {|i| i.id.as_json === params[:id] }

    if @recipe.save
      render :json => {'message' => 'saved'} 
    else
      render :json => {'message' => 'failed to save'}
    end
  end


end
