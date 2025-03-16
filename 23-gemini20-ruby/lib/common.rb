require 'ruby_llm'
require 'rainbow'


puts("🔑 Gemini key: #{ENV['GEMINI_API_KEY'].first(5) rescue :boh}..")

RubyLLM.configure do |config|
  config.gemini_api_key = ENV['GEMINI_API_KEY']
  config.default_image_model = "imagen-3.0-generate-002"

end

#chat = RubyLLM.chat
#gemini_chat = RubyLLM.chat(model: 'gemini-2.0-flash')
GeminiChat =  RubyLLM.chat(model: 'gemini-2.0-flash')




# help me write a function which puts() strings n the four different google logo colors, rotating: red blue green yellow and back again. It will probably use a global var to keep state
def print_rotating_color(message)
  colors = [:red, :blue, :green, :yellow]
  $color_index ||= 0
  color = colors[$color_index % colors.length]
  $color_index += 1
  puts Rainbow(message).send(color)
end

def print_rotating_color_no_newline(message)
  colors = [:red, :yellow , :blue, :green]
  $color_index ||= 0
  color = colors[$color_index % colors.length]
  $color_index += 1
  print Rainbow(message).send(color)
end

def print_rotating_color_with_newline(message)
  colors = [:red, :blue, :green, :yellow]
  $color_index ||= 0
  color = colors[$color_index % colors.length]
  $color_index += 1
  print Rainbow(message).send(color) + "\n"
end

def print_rotating_color_with_newline_and_prefix(prefix, message)
  colors = [:red, :blue, :green, :yellow]
  $color_index ||= 0
  color = colors[$color_index % colors.length]
  $color_index += 1
  print Rainbow(prefix).send(color) + message + "\n"
end

def print_rotating_color_with_prefix(prefix, message)
  colors = [:red, :blue, :green, :yellow]
  $color_index ||= 0
  color = colors[$color_index % colors.length]
  $color_index += 1
  print Rainbow(prefix).send(color) + message
end
