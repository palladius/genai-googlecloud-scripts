#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "net/http"
require "uri"
require "base64"

# Load environment variables from .env file
File.foreach(".env") do |line|
  key, value = line.chomp.split("=", 2)
  ENV[key.gsub("export ", "")] = value.delete("'") if key && value
end

gemini_api_key = ENV["GEMINI_API_KEY"]
model_id = "gemini-2.5-flash-image-preview"
generate_content_api = "streamGenerateContent"

request_body = {
  contents: [
    {
      role: "user",
      parts: [
        {
          text: "create image of Duffie Duck on a plane\n"
        }
      ]
    },
    {
      role: "model",
      parts: [
        {
          text: "Here is Daffy Duck on a plane! "
        },
        {
          inlineData: {
            mimeType: "image/png",
            data: Base64.strict_encode64(File.read("duffie-duck-original.png"))
          }
        }
      ]
    },
    {
      role: "user",
      parts: [
        {
          text: "Ok now please add Scrooge on top of the plane"
        }
      ]
    }
  ],
  generationConfig: {
    responseModalities: ["IMAGE", "TEXT"]
  }
}.to_json

uri = URI.parse("https://generativelanguage.googleapis.com/v1beta/models/#{model_id}:#{generate_content_api}?key=#{gemini_api_key}")

http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri.request_uri, "Content-Type" => "application/json")
request.body = request_body

response = http.request(request)

puts response.body

File.write("duffie-duck.response.json", response.body)
