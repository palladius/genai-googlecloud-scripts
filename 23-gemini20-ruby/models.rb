require 'ruby_llm'

all_models = RubyLLM.models.all
puts "Total models: #{all_models.count}"

#puts(all_models.first.inspect)
google_models = all_models.select{|m| m.provider == 'gemini'}
puts "Total Google models: #{google_models.count}"
google_models.each do |model|
  puts("🧠 #{model.id}" )
end


#puts(response.content)
