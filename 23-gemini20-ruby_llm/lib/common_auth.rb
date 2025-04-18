require 'ruby_llm'
require 'rainbow'


#puts("[common_auth] Gemini key: #{Rainbow(ENV['GEMINI_API_KEY']).purple}")
chomped_key = ENV['GEMINI_API_KEY'][0..4] rescue :unknown
puts("🔑 [common_auth] ENV[GEMINI_API_KEY]: #{Rainbow(chomped_key).purple}..")

RubyLLM.configure do |config|
  config.gemini_api_key = ENV['GEMINI_API_KEY']
  config.default_image_model = "imagen-3.0-generate-002"
  config.default_embedding_model = "text-embedding-004" # Google's model
  config.default_model = "gemini-2.0-flash"
end

# decent default
CommonChat = RubyLLM.chat(model: 'gemini-2.0-flash')

#llm = RubyLLM.new
