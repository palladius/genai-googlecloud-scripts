require 'ruby_llm'
require 'rainbow'


puts("[common_auth] Gemini key: #{Rainbow(ENV['GEMINI_API_KEY']).purple}")

RubyLLM.configure do |config|
  config.gemini_api_key = ENV['GEMINI_API_KEY']
end

#llm = RubyLLM.new
