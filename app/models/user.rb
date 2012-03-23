class User
  include MongoMapper::Document
  key :provider, String
  key :uid, String
  key :name, String
  key :admin, Boolean, :default => false
    
  
  def self.create_with_omniauth(auth)  
    user = User.new(:name => auth["info"]["name"], 
                    :provider => auth["provider"],
                    :uid => auth["uid"]  
                   )
    user.save
    return user
  end
end
