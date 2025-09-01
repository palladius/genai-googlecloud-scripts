#!/usr/bin/env ruby
# frozen_string_literal: true

require 'json'
require 'net/http'
require 'uri'
require 'base64'
require 'dotenv'
Dotenv.load

if ARGV.length != 2
  puts "Usage: #{ $PROGRAM_NAME } <image_file> <prompt>"
  exit 1
end

image_path = ARGV[0]
prompt = ARGV[1]

gemini_api_key = ENV['GEMINI_API_KEY']
model_id = 'gemini-2.5-flash-image-preview'
generate_content_api = 'streamGenerateContent'

request_body = {
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": prompt
        },
        {
          "inlineData": {
            "mimeType": "image/png",
            "data": Base64.strict_encode64(File.read(image_path))
          }
        }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["IMAGE", "TEXT"]
  }
}.to_json

uri = URI.parse("https://generativelanguage.googleapis.com/v1beta/models/#{ model_id }:#{ generate_content_api }?key=#{ gemini_api_key }")

http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')
request.body = request_body

response = http.request(request)



# Define output filenames
base_dir = File.dirname(image_path)
base_name = File.basename(image_path, '.*')
prompt_suffix = prompt.gsub(/[^a-zA-Z0-9_\-+]/, '_').gsub(/\s+/, '_').downcase
output_json_path = File.join(base_dir, "#{ base_name }.#{ prompt_suffix }.json")
output_image_path = File.join(base_dir, "#{ base_name }.#{ prompt_suffix }.png")


# Write the JSON response to a file
File.write(output_json_path, response.body)
puts "📝 JSON written to #{ output_json_path }"

# Parse the JSON response
response_data = JSON.parse(response.body)

# Check for errors
if response_data.first.key?('error')
  puts "\n🛑 API Error: #{ response_data.first['error']['message'] }"
  exit 1
end

# Check for prohibited content
if response_data.last['candidates'].first['finishReason'] == 'PROHIBITED_CONTENT'
  puts "\n🛑 The image was flagged as prohibited content and could not be processed."
  exit 1
else
  # Extract the base64 data
  b64_data = response_data.last['candidates'].first['content']['parts'].first['inlineData']['data']

  # Decode the base64 data and write it to a file
  File.open(output_image_path, 'wb') do |f|
    f.write(Base64.strict_decode64(b64_data))
  end

  puts "🖼️ Image extracted to #{ output_image_path }"
end
