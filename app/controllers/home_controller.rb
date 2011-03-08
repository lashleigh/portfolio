class HomeController < ApplicationController
  def index
    @faqs = Faq.find_all_by_visible(true)
  end

end
