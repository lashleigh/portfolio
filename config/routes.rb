Portfolio::Application.routes.draw do
  resources :faqs
  resources :networks

  constraints(:subdomain => /^blog$/) do
    resources :posts
    match "/" => 'posts#index'
  end

  match "/auth/:provider/callback" => "sessions#create"  
  match "/signout" => "sessions#destroy", :as => :signout  

  root :to => "home#index"
  match "home" => "home#index"
  match "home/index" => "home#index"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'
end
