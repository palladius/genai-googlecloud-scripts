# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

if User.count == 0
  puts('🌱 No user found - generating 1 or 2.')
#  user = User.create! :full_name => 'Riccar Doe', :email => 'rdoe@gmail.com', :password => 'topsecretCh4ng3m3plz', :password_confirmation => 'topsecretCh4ng3m3plz'
  user = User.create! :email => 'rdoe@gmail.com', :password => 'topsecretCh4ng3m3plz', :password_confirmation => 'topsecretCh4ng3m3plz'
  puts('Riccar Doe generated') if user
else
  puts('🌱 some user found - skipping generating.')
end

puts('🌱 Creating two samples chat WITH TITLE and SUMMARY.')

chat_record = Chat.create!(user: User.first, title: 'Generated from seed.', summary: 'TOOD ricc generate only if this title doesnt exist. oh and make title unique per user_id.')

chat2_with_instr = Chat.create!(
  user: User.last,
  title: 'Generated from seed (with Instructions)',
  summary: 'TOOD ricc generate only if this title doesnt exist. oh and make title unique per user_id.')
chat2_with_instr.with_instructions 'You only speak German and use emoji for anything. You try to be snarky and make humour but its not funny.'
