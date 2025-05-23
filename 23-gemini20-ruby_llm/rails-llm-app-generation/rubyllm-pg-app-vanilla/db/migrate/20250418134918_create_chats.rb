class CreateChats < ActiveRecord::Migration[8.0]
  def change
    create_table :chats do |t|
      t.string :model_id
      t.references :user # , null: false, foreign_key: true

      t.string :title # short
      t.text :summary # longer

      t.timestamps
    end
  end
end
