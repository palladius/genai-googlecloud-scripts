require 'ruby_llm'

all_models = RubyLLM.models.all
puts "Total models: #{all_models.count}"

#puts(all_models.first.inspect)
google_models = all_models.select{|m| m.provider == 'gemini'}
puts "Total Google models: #{google_models.count}"
# google_models.each do |model|
#   puts("MODEL 🧠 #{model.id}" )
# end

google_vision_models = RubyLLM.models.by_provider('gemini').chat_models.select(&:supports_vision)
puts("👀 Gemini vision models: #{google_vision_models.map{|m| m.id}.join ', '}")

#puts(response.content)
