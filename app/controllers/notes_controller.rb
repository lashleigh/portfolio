class NotesController < ApplicationController
  def new
    @recipe = Recipe.find(params[:recipe_id])
    note = Note.new
    render :json => note
  end

  def create
    recipe = Recipe.find(params[:recipe_id])
    note = Note.new(:time => params[:time], :body => params[:body])
    recipe.notes.push(note)  
    
    if note and note.save
      render :json => {:id => note.id, :time => note.time, :body => note.body}
    else
      render :json => {'message' => 'failed to save'}
    end
  end

  def update
    recipe = Recipe.find(params[:recipe_id])
    note = recipe.notes.find(params[:id])
    note.time = params[:time]
    note.body = params[:body]

    if note and note.save
      #TODO figure out why just rendering the note returns extraneous data
      #render :json => note 
      render :json => {:id => note.id, :time => note.time, :body => note.body}
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
