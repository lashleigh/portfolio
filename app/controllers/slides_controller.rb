class SlidesController < ApplicationController
  #before_filter :must_be_admin, :except => [:index, :show]
  # GET /slides
  # GET /slides.xml
  def index
    @slides = Slide.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @slides }
    end
  end

  # GET /slides/1
  # GET /slides/1.xml
  def show 
    @slide = Slide.find(params[:id])

    respond_to do |format|
      format.html # slide.html.erb
      format.xml  { render :xml => @slide }
    end
  end

  # GET /slides/new
  # GET /slides/new.xml
  def new
    @slide = Slide.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @slide }
    end
  end

  # GET /slides/1/edit
  def edit
    @slide = Slide.find(params[:id])
  end
  
  # POST /slides
  # POST /slides.xml
  def create
    show = Show.find(params[:show_id])
    before = Slide.find(params[:insert_id])
    if show and before 
      @slide = show.new_slide
      show.change_slide_order(@slide, before.index+1)
      if params[:copy] == 'true'
        @slide.scripts = before.scripts
      end
      @slide.reload
      slidehtml = render_to_string :partial => 'slide', :object => @slide
    end

    if @slide and @slide.save
      render :json => {'slide' => @slide, 'slidehtml' => slidehtml}
    else
      render :json => {'status' => 'faliure'}
    end
  end

  # PUT /slides/1
  # PUT /slides/1.xml
  def update
    @slide = Slide.find(params[:id])

    respond_to do |format|
      if @slide.update_attributes(params[:slide])
        format.html { redirect_to(@slide, :notice => 'Slide was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @slide.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /slides/1
  # DELETE /slides/1.xml
  def destroy
    @slide = Slide.find(params[:id])
    @slide.destroy

    respond_to do |format|
      format.html { redirect_to(slides_url) }
      format.xml  { head :ok }
    end
  end


end
