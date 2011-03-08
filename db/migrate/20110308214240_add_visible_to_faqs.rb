class AddVisibleToFaqs < ActiveRecord::Migration
  def self.up
    add_column :faqs, :visible, :boolean, :default => true
  end

  def self.down
    remove_column :faqs, :visible
  end
end
