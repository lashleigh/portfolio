class NotesController < ApplicationController
  def new
    @recipe = Recipe.find(params[:recipe_id])
    note = Note.new
    render :json => note
  end

  def create
    recipe = Recipe.find(params[:recipe_id])
    attrs = params.reject {|p| p == 'ingredient'}
    note = Note.new(attrs)
    recipe.notes.push(note)  
    
    if recipe.save
      render :json => note
    else
      render :json => {'message' => 'failed to save'}
    end
  end

  def update
    recipe = Recipe.find(params[:recipe_id])
    note = recipe.notes.find(params[:id])
    attrs = params.select {|p| note.attributes.keys.include? p}
    note.update_attributes(attrs) 

    if recipe.save
      render :json => note
    else
      render :json => {'message' => 'failed to save'}
    end
  end

  def destroy
    @recipe = Recipe.find(params[:recipe_id])
    @recipe.notes.delete_if {|i| i.id.as_json === params[:id] }

    if @recipe.save
      render :json => {'message' => 'saved'} 
    else
      render :json => {'message' => 'failed to save'}
    end
  end

end
