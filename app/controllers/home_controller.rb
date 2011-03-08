class HomeController < ApplicationController
  def index
    @faqs = Faq.all
  end

end
