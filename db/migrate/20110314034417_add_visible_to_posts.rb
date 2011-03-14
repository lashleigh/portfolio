class AddVisibleToPosts < ActiveRecord::Migration
  def self.up
    add_column :posts, :visible, :boolean, :default => false
  end

  def self.down
    remove_column :posts, :visible
  end
end
