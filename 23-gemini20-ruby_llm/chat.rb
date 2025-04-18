require 'ruby_llm'

puts("Gemini key: #{ENV['GEMINI_API_KEY']}")

RubyLLM.configure do |config|
  config.gemini_api_key = ENV['GEMINI_API_KEY']
end

#chat = RubyLLM.chat
chat = RubyLLM.chat(model: 'gemini-2.0-flash')

response = chat.ask "What's the best way to code Ruby with Google Cloud and Gemini? Is there any influencer I should follow? Any GCP Developer Advocate comes to mind? Be concise and give me precise links and names - no generic boilerplate."

all_models = RubyLLM.models.all
puts "Total models: #{all_models.count}"

puts(response.content)
