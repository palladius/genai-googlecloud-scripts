require 'ruby_llm'
require 'rainbow'

require_relative 'lib/common'

#image_prompt = "a sunset over mountains"
image_prompt = "a cyberpunk cityscape with flying avocadoes"
filename = 'cybercity.png'

puts("♊️ image_prompt: #{Rainbow(image_prompt).yellow}")

image = RubyLLM.paint(
  image_prompt,
  model: "imagen-3.0-generate-002",
  size: "1024x1024"
#  size: "2048x2048"
)

# For base64 images (like Gemini's Imagen)
if image.base64?
  puts "MIME type: #{image.mime_type}"
  puts "Base64 data available"
end

image.save(filename)
puts("💾 Saved: #{filename}")
stats = `file '#{filename}'`
puts("💾 Stats: #{stats.chomp}")
