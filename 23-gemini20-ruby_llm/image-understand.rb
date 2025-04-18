require 'rainbow'
require 'ruby_llm'
require_relative 'lib/common_auth'

#chat = RubyLLM.chat(model: 'gemini-2.0-flash')

chat = RubyLLM.chat(model: 'gemini-2.0-flash')

ImagePath = ENV.fetch("IMAGE_PATH", 'medieval-cityscape-flying-beholders.png')
ImageContentPath = ImagePath + ".md"
ret = chat.ask "What's in this image?", with: { image: ImagePath }
print("🖼️ Image file: #{Rainbow(ImagePath).white}")
print("🖼️ Image content: #{Rainbow(ret.content).cyan}")

#File(ImageContentPath).write("## Content\n\n" + ret.content)

# write to file, above code is broken
File.open(ImageContentPath, 'w') do |file|
  file.write("## Content\n\n")
  file.write(ret.content)
end

print("🖼️ .. written in : #{Rainbow(ImageContentPath).white}")
# Write this in IMA
