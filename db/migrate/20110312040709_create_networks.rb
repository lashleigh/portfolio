class CreateNetworks < ActiveRecord::Migration
  def self.up
    create_table :networks do |t|
      t.string :src
      t.string :href
      t.string :title
      t.integer :position
      t.string :which, :default => 'primary'

      t.timestamps
    end
  end

  def self.down
    drop_table :networks
  end
end
