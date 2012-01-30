class PartsController < ApplicationController
  def new
    @recipe = Recipe.find(params[:recipe_id])
    part = Part.new
    render :json => part
  end

  def create
    recipe = Recipe.find(params[:recipe_id])
    attrs = params.reject {|p| p == 'ingredient'}
    part = Part.new(attrs)
    if params[:ingredient_id].blank?
      ingredient = Ingredient.find_or_create_by_name(params[:ingredient][:name])
      part.ingredient = ingredient
    end
    recipe.parts.push(part)  
    
    if recipe.save
      render :json => part
    else
      render :json => {'message' => 'failed to save'}
    end
  end

  def update
    recipe = Recipe.find(params[:recipe_id])
    part = recipe.parts.find(params[:id])
    attrs = params.select {|p| part.attributes.keys.include? p}
    if part.ingredient.name != params[:ingredient][:name]
      attrs[:ingredient_id] = Ingredient.find_or_create_by_name(params[:ingredient][:name]).id
    end
    part.update_attributes(attrs) 

    if recipe.save
      render :json => part
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
