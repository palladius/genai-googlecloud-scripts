require 'ruby_llm'
require_relative 'lib/common_auth'

chat = RubyLLM.chat(model: 'gemini-2.0-flash')

response = chat.ask "What's the best way to code Ruby with Google Cloud and Gemini? Is there any influencer I should follow? Any GCP Developer Advocate comes to mind? Be concise and give me precise links and names - no generic boilerplate."

all_models = RubyLLM.models.all
puts "Total models: #{all_models.count}"

puts(response.content)
