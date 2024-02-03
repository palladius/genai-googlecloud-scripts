#! /usr/bin/env ruby

require 'gemini-ai'
require_relative 'lib/common'
require 'colorize'
require 'base64'
require 'mimemagic'

# init
$client = Gemini.new(
    credentials: {
      service: 'vertex-ai-api',
      region: 'us-central1',
      project_id: auto_project_id()
    },
    options: { model: 'gemini-pro-vision', server_sent_events: true }
)

def describe_medium(filename, question: nil)
  raise "File not found: #{filename}" unless File.exist?(filename)
  # My experience: it worked with 11MB,
  # With 49MB it succeeds after 1min (!)
  raise "File too BIG!" if File.size(filename) > 40_000_000
  mime_type = MimeMagic.by_magic(File.open(filename)).type
  human_type = mime_type.split('/').first
  question ||= "Describe this #{human_type}."
  #question ||= "Describe all text writings you can recognize in this #{human_type}."
  # => image/jpeg
  # => video/mp4 ..
  file_size_kb = File.size(filename)/1024
  file_short= File.basename filename
  puts("describe_medium(#{file_short.colorize :cyan}): Type=#{mime_type.colorize :cyan}.\tSize: #{file_size_kb.to_s.colorize :mode => :bold} KB")
  puts("♊️'#{question.colorize(:yellow)}'..")
  emoji  = human_type == 'image' ? '🏞️' : '🎥'

  input = { contents: [
    { role: 'user', parts: [
      { text: question },
      { inline_data: {
        mime_type: mime_type,
        data: Base64.strict_encode64(File.read(filename))
      } }
    ] }
  ] }
  result = $client.stream_generate_content(input)
  #present_gemini_result(result, debug: true)
  str_result = gemini_result_to_string(result)
  puts "💾 #{filename.colorize(:color => :cyan)} => #{emoji} #{str_result.colorize(:color => :yellow, :mode => :bold)}"

  result
end

# def describe_image(filename)
#   question ||= "Describe this image."
#   raise "File not found: #{filename}" unless File.exist?(filename)

#   input = { contents: [
#     { role: 'user', parts: [
#       { text: question },
#       { inline_data: {
#         mime_type: 'image/jpeg',
#         data: Base64.strict_encode64(File.read(filename))
#       } }
#     ] }
#   ] }
#   result = $client.stream_generate_content(input)
#   #present_gemini_result(result, debug: true)
#   str_result = gemini_result_to_string(result)
#   puts "🏞️ 🙋‍♂️ #{str_result}".colorize(:color => :yellow, :mode => :bold)

#   result
# end

# #
def main
  #puts MimeMagic.by_magic(File.open('inputs/piano.jpg')).type
  #describe_image 'inputs/piano.jpg'
  ARGV.each do |file_name|
    puts "File found in ARGV: #{file_name}"
    describe_medium file_name
  end
  if ARGV.size == 0
    puts "No ARGV given! I'll give you an 🍱 Omakase sample of Img and Video!"
    describe_medium 'inputs/piano.jpg'
    describe_medium 'inputs/seby-biliardo.mp4'
    # describe_medium 'inputs/seby-first-day-school-bike.mp4'
    # describe_medium 'inputs/pouring_of_coffee (360p).mp4'
  end
end


main() if __FILE__ == $PROGRAM_NAME
