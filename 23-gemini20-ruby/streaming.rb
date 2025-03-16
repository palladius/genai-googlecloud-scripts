# require 'ruby_llm'
require 'ruby_llm'
require 'rainbow'

require_relative 'lib/common'

# help me write a function which puts() strings n the four different google logo colors, rotating: red blue green yellow and back again. It will probably use a global var to keep state
def print_rotating_color(message)

end

# RubyLLM.configure do |config|
#   config.gemini_api_key = ENV['GEMINI_API_KEY']
# end

# chat = RubyLLM.chat

final_message = GeminiChat.ask "Write a short story about a programmer" do |chunk|
  # Each chunk contains a portion of the response
  print "[#{chunk.input_tokens}/#{chunk.output_tokens}] #{chunk.content}"
end

puts "\nFinal message length: #{final_message.content.length}"
puts "Token usage: #{final_message.output_tokens} tokens"
