Rails.application.config.middleware.use OmniAuth::Builder do
  provider :twitter, 'UwNJnKt17WQlwdakePslWQ', 'ecCHiaWzhqXjJZQ6LtgiAyJmwDnEJF2i3acBkhKRdD8'
  #provider :facebook, 'APP_ID', 'APP_SECRET'
  #provider :linked_in, 'CONSUMER_KEY', 'CONSUMER_SECRET'
end
