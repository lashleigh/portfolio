class ApplicationController < ActionController::Base
  protect_from_forgery
  helper_method :current_user  

  protected
  def must_be_admin
    unless current_user and current_user.admin?
      redirect_to root_url, :notice => "You are not authorized to use this portion of the site."
      return false
    end
  end

  private  
  def current_user  
    @current_user ||= User.find(session[:user_id]) if session[:user_id]  
  end 
end
