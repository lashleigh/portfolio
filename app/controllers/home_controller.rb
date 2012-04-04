class HomeController < ApplicationController
  def index
    @about = Faq.find_by_question('about')
    @faqs = Faq.visible.sort(:position).all
  end
end
