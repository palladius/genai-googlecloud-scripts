#!/usr/bin/env ruby

require 'colorize'

# This file is genai-text-generate.rb
#
# Before running, make sure you've done the following:
#     gem install google-apis-aiplatform_v1
#     gcloud auth application-default login
#
# Also, update the four constants below as needed.
#
# Then execute the file:
#     PROJECT_ID=your-real-project ruby genai-text-generate.rb
#
# It will create a directory called "out" and write the text files there.

PROJECT = ENV.fetch('PROJECT_ID') || `gcloud config get core/project`.chomp
OUTPUT_DIR = "out"
#MODEL_ID = "text-bison@001"
MODEL_ID = "text-unicorn"
MESSAGE = ENV.fetch('MESSAGE',"Please write me 3 random genai prompts.")
DEBUG = ENV.fetch('DEBUG') || false

require "base64"
require "fileutils"
require "google/apis/aiplatform_v1"



def generate_text(message)
  client = Google::Apis::AiplatformV1::AiplatformService.new
  client.root_url = "https://us-central1-aiplatform.googleapis.com/"
  client.authorization = Google::Auth.get_application_default

  puts("💛 Request created for message: '#{message}'.")
  # defined here: https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text
  request = Google::Apis::AiplatformV1::GoogleCloudAiplatformV1PredictRequest.new \
    instances: [
      {
  #      content: MESSAGE.tr('"', "")
        prompt: message.tr('"', "")
      }
    ],
    parameters: {
      temperature: 0.8,
      maxOutputTokens: 1000,
      topP: 0.8,
      topK: 40,
      echo: true,
    }
    endpoint ="projects/#{PROJECT}/locations/us-central1/publishers/google/models/#{MODEL_ID}"
    puts("Building Response for endpoint=#{endpoint}...")
    puts("Request: #{request}")

    response = client.predict_project_location_publisher_model(endpoint,request)
    if DEBUG
      puts("Response received: #{response}")
      puts("Response predictions: #{response.predictions}")
      puts("Response Inspect: #{response.inspect}")
    end

  FileUtils.mkdir_p OUTPUT_DIR

  response.predictions.each_with_index do |prediction, index|
    filename = "#{OUTPUT_DIR}/song-#{index}.txt"
    File.write filename, prediction["content"]
    puts "Wrote #{filename}"
    if DEBUG
      puts "🎵 Here's the Prediction response #{index+1}:"
      puts prediction["content"].colorize(:light_blue)
    end

  end


end


raise "PROJECT_ID must be set (its '#{PROJECT}')" if PROJECT.nil? or PROJECT == '(unset)'
generate_text(MESSAGE)
