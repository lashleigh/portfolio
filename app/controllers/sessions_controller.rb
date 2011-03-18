class SessionsController < ApplicationController
  def create  
    auth = request.env["omniauth.auth"]  
    user = User.find_by_provider_and_uid(auth["provider"], auth["uid"]) || User.create_with_omniauth(auth)  
    session[:user_id] = user.id  
    do_redirect
  end 

  def destroy  
    session[:user_id] = nil  
    do_redirect
  end 

  def twitter
    session[:redirect_target] = request.referer unless session[:redirect_target]
    redirect_to :controller => :auth, :action => :twitter
  end

  private
  def do_redirect
    if session[:redirect_target]
      redirect_to session[:redirect_target]
      session[:redirect_target] = nil
    else
      redirect_to root_url 
    end
  end
end
