#!/usr/bin/env ruby

# This file is genai-code-generate.rb
#
# Before running, make sure you've done the following:
#     gem install google-apis-aiplatform_v1
#     gcloud auth application-default login
#
# Also, update the four constants below as needed.
#
# Then execute the file:
#     PROJECT_ID=your-real-project ruby genai-code-generate.rb
#
# It will create a directory called "out" and write the text files there.

PROJECT = ENV.fetch('PROJECT_ID', `gcloud config get core/project`.chomp)
OUTPUT_DIR = "out"
MODEL_ID='code-gecko' # @001
MESSAGE = "def reverse_string(s):
    return s[::-1]
def test_empty_input_string()
"

require "base64"
require "fileutils"
require "google/apis/aiplatform_v1"

client = Google::Apis::AiplatformV1::AiplatformService.new
client.root_url = "https://us-central1-aiplatform.googleapis.com/"
client.authorization = Google::Auth.get_application_default

puts "Querying to project_id=#{PROJECT} for Code completion of this message: '''#{MESSAGE}'''"

request = Google::Apis::AiplatformV1::GoogleCloudAiplatformV1PredictRequest.new \
    instances: [
        {
            prefix: MESSAGE.tr('"', "")
        }
    ],
    parameters: {
        temperature: 0.5,
        maxOutputTokens: 64,
        candidateCount: 2
    }

response = client.predict_project_location_publisher_model \
    "projects/#{PROJECT}/locations/us-central1/publishers/google/models/#{MODEL_ID}",
    request

FileUtils.mkdir_p OUTPUT_DIR
response.predictions.each_with_index do |prediction, index|
    filename = "#{OUTPUT_DIR}/code-#{index}.txt"
    File.write filename, prediction["content"]
    puts "Wrote #{filename}"
end