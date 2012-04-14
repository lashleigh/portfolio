class ApplicationController < ActionController::Base
  protect_from_forgery
  helper_method :current_user  

  protected
  def must_be_admin
    unless current_user and current_user.admin?
      if current_user
        flash[:error] = "You must be an admin to do that."
        redirect_to root_url 
      else
        session[:redirect_target] = request.fullpath
        redirect_to "/auth/twitter" 
      end
    end
  end
  def must_be_signed_in
    !!@current_user
  end

  private  
  def current_user  
    @current_user ||= User.find(session[:user_id]) if session[:user_id]  
  end 

end
