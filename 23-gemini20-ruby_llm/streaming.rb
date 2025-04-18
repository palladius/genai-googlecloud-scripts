require 'ruby_llm'
require 'rainbow'

#require_relative 'lib/common'
require_relative 'lib/common_auth'
require_relative 'lib/silly_colors'


final_message = CommonChat.ask "Scrivi una Barzelletta alla Berlusconi" do |chunk|
  # Each chunk contains a portion of the response
  print_rotating_color_no_newline chunk.content
end

puts('')
puts "🔹 Final message length: #{final_message.content.length}"
puts "🔹 Token usage: #{final_message.output_tokens} tokens"
puts("🔹 Note: I used Google Colors to demonstrate streaming on CLI: one color one chunk")
