class Network < ActiveRecord::Base
  scope :primary, where("which = ?", "primary")  
end
