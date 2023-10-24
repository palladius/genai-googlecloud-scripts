#!/usr/bin/env ruby

# TODO

# This file is genai-text-generate.rb
#
# Before running, make sure you've done the following:
#     gem install google-apis-aiplatform_v1
#     gcloud auth application-default login
#
# Also, update the four constants below as needed.
#
# Then execute the file:
#     ruby genai-text-generate.rb
#
# It will create a directory called "out" and write the text files there.

PROJECT = ENV.fetch 'PROJECT_ID', "my-project-name"
OUTPUT_DIR = "out"
MODEL_ID = "textembedding-gecko" # @001
MESSAGES = [
    "Nel mezzo del cammin di nostra vita, mi ritrovai per una selva oscura",
    "Ahi a dir qual era e' cosa dura!",
    "To be or not to  be, *this* is the question!",
]
# assert size is not more than 5 - i think its the limit
require "base64"
require "fileutils"
require "google/apis/aiplatform_v1"

client = Google::Apis::AiplatformV1::AiplatformService.new
client.root_url = "https://us-central1-aiplatform.googleapis.com/"
client.authorization = Google::Auth.get_application_default

# Array of hashes
ArrayOfContentHashes = MESSAGES.map{|message| {content: message.tr('"', "") }}

request = Google::Apis::AiplatformV1::GoogleCloudAiplatformV1PredictRequest.new \
  instances: ArrayOfContentHashes
  #[
    #{
    #  content: MESSAGE.tr('"', "")
    #}
  #]
#   parameters: {
#     temperature: 0.8,
#     maxOutputTokens: 1000,
#     topP: 0.8,
#     topK: 40
#   }

response = client.predict_project_location_publisher_model \
  "projects/#{PROJECT}/locations/us-central1/publishers/google/models/#{MODEL_ID}",
  request

#puts "Request: ", request

FileUtils.mkdir_p OUTPUT_DIR
response.predictions.each_with_index do |prediction, index|
  #puts "Prediction[#{index}]: #{prediction['embeddings'].class}"
  puts "⦿ Original Messages: #{MESSAGES[index]}"
  puts "⦿ Statistics: #{prediction['embeddings']['statistics']}"
  puts "⦿ Dimensions: #{prediction['embeddings']['values'].size}"
  filename = "#{OUTPUT_DIR}/embedding-#{index}.txt"
  File.write filename, prediction["embeddings"]
  puts "Wrote #{filename}"
end