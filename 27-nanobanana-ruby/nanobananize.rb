#!/usr/bin/env ruby
# frozen_string_literal: true

require 'json'
require 'net/http'
require 'uri'
require 'base64'
require 'dotenv'
Dotenv.load

if ARGV.length != 2
  puts "Usage: #{$PROGRAM_NAME} <image_file> <prompt>"
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

uri = URI.parse("https://generativelanguage.googleapis.com/v1beta/models/#{model_id}:#{generate_content_api}?key=#{gemini_api_key}")

http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')
request.body = request_body

response = http.request(request)

# Write the JSON response to a file
File.write('nanobanana.response.json', response.body)
puts "📝 JSON written to nanobanana.response.json"

# Parse the JSON response
response_data = JSON.parse(response.body)

# Check for errors
if response_data.first.key?('error')
  puts "\n🛑 API Error: #{response_data.first['error']['message']}"
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
  File.open('nanobanana.response.png', 'wb') do |f|
    f.write(Base64.strict_decode64(b64_data))
  end

  puts "🖼️ Image extracted to nanobanana.response.png"
end