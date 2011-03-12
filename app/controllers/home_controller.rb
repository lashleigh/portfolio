class HomeController < ApplicationController
  def index
    @about = Faq.find_by_question('about')
    @faqs = Faq.find(:all, :order => 'position ASC', :conditions => {:visible => true}) - @about.to_a
    @networks = Network.find(:all)
  end

end
