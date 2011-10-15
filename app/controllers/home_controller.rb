class HomeController < ApplicationController
  def index
    @about = Faq.find_by_question('about')
    @faqs = Faq.visible.sort(:position).all
    @primary = Network.primary.sort(:position).all
  end

  def admin
    render :layout => 'faqs'
  end

end
