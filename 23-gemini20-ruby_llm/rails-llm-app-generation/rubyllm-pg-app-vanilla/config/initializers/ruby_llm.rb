require 'ruby_llm'
require 'rainbow'

chomped_key = ENV['GEMINI_API_KEY'][0..4] rescue :unknown
puts("🔑 [config/initializers/ruby_llm] ENV[GEMINI_API_KEY]: #{Rainbow(chomped_key).red}..")


RubyLLM.configure do |config|
  # --- Provider API Keys ---
  # Provide keys ONLY for the providers you intend to use.
  # Using environment variables (ENV.fetch) is highly recommended.
#  config.openai_api_key = ENV.fetch('OPENAI_API_KEY', nil)
#  config.anthropic_api_key = ENV.fetch('ANTHROPIC_API_KEY', nil)
  config.gemini_api_key = ENV.fetch('GEMINI_API_KEY', nil)

#  config.deepseek_api_key = ENV.fetch('DEEPSEEK_API_KEY', nil)

  # --- Default Models ---
  # Used by RubyLLM.chat, RubyLLM.embed, RubyLLM.paint if no model is specified.

  config.default_image_model = "imagen-3.0-generate-002"
  config.default_embedding_model = "text-embedding-004" # Google's model
  config.default_model = "gemini-2.0-flash"

  # --- Connection Settings ---
  config.request_timeout = 120  # Request timeout in seconds (default: 120)
  config.max_retries = 3        # Max retries on transient network errors (default: 3)
  config.retry_interval = 0.1 # Initial delay in seconds (default: 0.1)
  config.retry_backoff_factor = 2 # Multiplier for subsequent retries (default: 2)
  config.retry_interval_randomness = 0.5 # Jitter factor (default: 0.5)
end



# RubyLLM.configure do |config|
#   config.gemini_api_key = ENV['GEMINI_API_KEY']
#   config.default_image_model = "imagen-3.0-generate-002"
#   config.default_embedding_model = "text-embedding-004" # Google's model
#   config.default_model = "gemini-2.0-flash"
# end
