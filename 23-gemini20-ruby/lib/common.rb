require 'ruby_llm'
require 'rainbow'


puts("Gemini key: #{ENV['GEMINI_API_KEY']}")

RubyLLM.configure do |config|
  config.gemini_api_key = ENV['GEMINI_API_KEY']
end

#chat = RubyLLM.chat
#gemini_chat = RubyLLM.chat(model: 'gemini-2.0-flash')
GeminiChat =  RubyLLM.chat(model: 'gemini-2.0-flash')
