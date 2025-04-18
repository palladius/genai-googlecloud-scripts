require 'ruby_llm'
require 'rainbow'

chomped_key = ENV['GEMINI_API_KEY'].first(5) rescue :boh
puts("🔑 Gemini key: #{Rainbow(chomped_key).yellow)}..")

RubyLLM.configure do |config|
  config.gemini_api_key = ENV['GEMINI_API_KEY']
  config.default_image_model = "imagen-3.0-generate-002"
end

#chat = RubyLLM.chat
#gemini_chat = RubyLLM.chat(model: 'gemini-2.0-flash')
GeminiChat =  RubyLLM.chat(model: 'gemini-2.0-flash')
