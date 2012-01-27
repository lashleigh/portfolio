class IngredientsController < ApplicationController
  def new
    @recipe = Recipe.find(params[:recipe_id])
    @ingredient = Ingredient.new
    render :json => @ingredient
  end

  def create
    @recipe = Recipe.find(params[:recipe_id])
    @ingredient = Ingredient.new(:amount => params[:amount], :name => params[:name], :unit => params[:unit])
    @recipe.ingredients.push(@ingredient)  
    
    if @recipe.save
      render :json => @ingredient
    else
      render :json => {'message' => 'failed to save'}
    end
  end

  def update
    @recipe = Recipe.find(params[:recipe_id])
    @ingredient = @recipe.ingredients.find(params[:id])
    attrs = params.select {|p| @ingredient.attributes.keys.include? p}
    if params[:order]
      @recipe.splice(@ingredient, params[:order])
    else
      @ingredient.update_attributes(attrs) 
    end

    if @recipe.save
      render :json => @ingredient
    else
      render :json => {'message' => 'failed to save'}
    end
  end

  def destroy
    @recipe = Recipe.find(params[:recipe_id])
    @recipe.ingredients.delete_if {|i| i.id.as_json === params[:id] }

    if @recipe.save
      render :json => {'message' => 'saved'} 
    else
      render :json => {'message' => 'failed to save'}
    end
  end

end
