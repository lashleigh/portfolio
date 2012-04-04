class IngredientsController < ApplicationController
  def index
    @ingredients = Ingredient.sort(:category).all

    respond_to do |format|
      format.html  # index.html.erb
      format.json  { render :json => @ingredients }
    end
  end

  def create
    @ingredient = Ingredient.new(:name => params[:name], :category => params[:category])
    
    if @ingredient.save
      render :json => @ingredient
    else
      render :json => {'message' => 'failed to save'}
    end
  end

  def update
    @ingredient = Ingredient.find(params[:id])
    @ingredient.update_attributes({:name => params[:name], :category => params[:category]})

    if @ingredient.save
      render :json => @ingredient
    else
      render :json => {'message' => 'failed to save'}
    end
  end

  def destroy
    @ingredient = Ingredient.find(params[:id])

    if @ingredient.destroy
      render :json => {'message' => 'success'} 
    else
      render :json => {'message' => 'failed to destroy'}
    end
  end
end
