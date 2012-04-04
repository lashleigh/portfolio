require 'omniauth-openid'
require 'openid/store/filesystem'

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :twitter, 'UwNJnKt17WQlwdakePslWQ', 'ecCHiaWzhqXjJZQ6LtgiAyJmwDnEJF2i3acBkhKRdD8'
  provider :openid, :store => OpenID::Store::Filesystem.new('/tmp')

  #provider :facebook, 'APP_ID', 'APP_SECRET'
  #provider :linked_in, 'CONSUMER_KEY', 'CONSUMER_SECRET'
end
