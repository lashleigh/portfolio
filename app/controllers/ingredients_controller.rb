class IngredientsController < ApplicationController
  # GET /recipes/new
  # GET /recipes/new.xml
  def new
    @recipe = Recipe.find(params[:recipe_id])
    @ingredient = Ingredient.new

    render :json => @ingredient
  end

  # POST /recipes
  # POST /recipes.xml
  def create
    @recipe = Recipe.find(params[:recipe_id])
    @ingredient = Ingredient.new(:amount => params[:amount], :name => params[:name])
    @recipe.ingredients.push(@ingredient)  
    
    if @recipe.save
      render :json => @ingredient
    else
      render :json => {'message' => 'failed to save'}
    end
  end

  # PUT /recipes/1
  # PUT /recipes/1.xml
  def update
    @recipe = Recipe.find(params[:recipe_id])
    @ingredient = @recipe.ingredients.find(params[:id])
    @ingredient.update_attributes(:amount => params[:amount], :name => params[:name])

    if @recipe.save
      render :json => @ingredient
    else
      render :json => {'message' => 'failed to save'}
    end
  end

  # DELETE /recipes/1
  # DELETE /recipes/1.xml
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
