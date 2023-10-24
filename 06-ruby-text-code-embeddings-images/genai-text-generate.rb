
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

PROJECT = "my-project-name"
OUTPUT_DIR = "out"
MODEL_ID = "text-bison@001"
MESSAGE = "Please write me 3 random genai prompts."

require "base64"
require "fileutils"
require "google/apis/aiplatform_v1"

client = Google::Apis::AiplatformV1::AiplatformService.new
client.root_url = "https://us-central1-aiplatform.googleapis.com/"
client.authorization = Google::Auth.get_application_default

request = Google::Apis::AiplatformV1::GoogleCloudAiplatformV1PredictRequest.new \
  instances: [
    {
      content: MESSAGE.tr('"', "")
    }
  ],
  parameters: {
    temperature: 0.8,
    maxOutputTokens: 1000,
    topP: 0.8,
    topK: 40
  }
response = client.predict_project_location_publisher_model \
  "projects/#{PROJECT}/locations/us-central1/publishers/google/models/#{MODEL_ID}",
  request

FileUtils.mkdir_p OUTPUT_DIR
response.predictions.each_with_index do |prediction, index|
  filename = "#{OUTPUT_DIR}/song-#{index}.txt"
  File.write filename, prediction["content"]
  puts "Wrote #{filename}"
end