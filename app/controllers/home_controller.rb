class HomeController < ApplicationController
  def index
    @about = Faq.find_by_question('about')
    @faqs = Faq.visible.order("position ASC")
    @primary = Network.primary.order("position ASC")
  end

  def admin
    render :layout => 'faqs'
  end

end
