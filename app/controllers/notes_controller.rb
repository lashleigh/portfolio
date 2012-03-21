class NotesController < ApplicationController
  def create
    recipe = Recipe.find(params[:recipe_id])
    note = Note.new(:time => params[:time], :body => params[:body])
    recipe.notes.push(note)  
    
    if note and note.save
      render :json => note 
    else
      render :json => {'message' => 'failed to save'}
    end
  end

  def update
    recipe = Recipe.find(params[:recipe_id])
    note = recipe.notes.find(params[:id])

    if note and note.update_attributes({:time => params[:time], :body => params[:body]})
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
