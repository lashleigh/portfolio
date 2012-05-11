Portfolio::Application.routes.draw do
  resources :faqs  
  constraints(:subdomain => /^blog$/) do
    match "/" => 'posts#index'
    resources :posts
  end

  match "/auth/:provider/callback" => "sessions#create"  
  match "/signout" => "sessions#destroy", :as => :signout  
  match "/admin" => "faqs#index"

  root :to => "home#index"
end
