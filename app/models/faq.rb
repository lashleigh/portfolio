class Faq < ActiveRecord::Base
  scope :visible, where("visible = ?", true)  
end
