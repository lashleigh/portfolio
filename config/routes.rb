Portfolio::Application.routes.draw do
  resources :faqs
  resources :networks
  resources :shows
  resources :slides
  resources :recipes

  constraints(:subdomain => /^baked$/) do
    match "/" => 'recipes#index'
    match "/recipes/from_params" => 'recipes#new_by_params'
    resources :recipes do
      resources :parts
    end
  end
  constraints(:subdomain => /^blog$/) do
    match "/" => 'posts#index'
    resources :posts
  end

  match "/auth/:provider/callback" => "sessions#create"  
  match "/signout" => "sessions#destroy", :as => :signout  

  root :to => "home#index"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'
end
