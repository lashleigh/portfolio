class PartsController < ApplicationController
  def create
    recipe = Recipe.find(params[:recipe_id])
    part = Part.new({:amount => params[:amount], :percent => params[:percent], :fixed_percent => params[:fixed_percent]})
    if params[:ingredient_id].blank?
      ingredient = Ingredient.find_or_create_by_name(params[:ingredient][:name])
      part.ingredient = ingredient
    end
    recipe.parts.push(part)  
    
    if part and part.save
      render :json => part
    else
      render :json => {'message' => 'failed to save'}
    end
  end

  def update
    recipe = Recipe.find(params[:recipe_id])
    part = recipe.parts.find(params[:id])
    if part.ingredient.name != params[:ingredient][:name]
      part.ingredient = Ingredient.find_or_create_by_name(params[:ingredient][:name])
    end
    part.update_attributes({:amount => params[:amount], :percent => params[:percent], :fixed_percent => params[:fixed_percent]}) 

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
