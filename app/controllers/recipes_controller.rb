class RecipesController < ApplicationController
  #before_filter :must_be_admin, :except => ['index', 'show']

  def index
    @recipes = Recipe.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @recipes }
    end
  end

  # GET /recipes/1
  # GET /recipes/1.xml
  def show
    @recipe = Recipe.find(params[:id])
    @stats = @recipe.stats

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @recipe }
    end
  end

  # GET /recipes/new
  # GET /recipes/new.xml
  def new
    @recipe = Recipe.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @recipe }
    end
  end

  # GET /recipes/1/edit
  def edit
    @recipe = Recipe.find(params[:id])
    @ingredients = Ingredient.autocomplete_list
  end

  # POST /recipes
  # POST /recipes.xml
  def create
    @recipe = Recipe.create!(:title => params[:title] || 'no title')
    @recipe.interpret(params)

    if @recipe.save
      redirect_to(@recipe, :notice => 'Recipe was successfully created.')
    else
      #TODO what should happen? I have no idea
    end
  end

  # PUT /recipes/1
  # PUT /recipes/1.xml
  def update
    recipe = Recipe.find(params[:id])
    if !params[:title].blank?
      recipe.title = params[:title]
    end

    if recipe.save
      render :json => recipe
    else
      render :json => {'message' => 'failed to save'}
    end
  end

  # DELETE /recipes/1
  # DELETE /recipes/1.xml
  def destroy
    @recipe = Recipe.find(params[:id])
    @recipe.destroy

    respond_to do |format|
      format.html { redirect_to(recipes_url) }
      format.xml  { head :ok }
    end
  end

end
