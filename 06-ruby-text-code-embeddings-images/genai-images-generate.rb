#!/usr/bin/env ruby

# This file is images-generate.rb
#
# Before running, make sure you've done the following:
#     gem install google-apis-aiplatform_v1
#     gcloud auth application-default login
#
# Also, update the three constants below.
#
# Then execute the file:
#     ruby images-generate.rb
#
# It will create a directory called "out" and write the PNG files there.
# Currently using model 002 - which should be the default.

PROJECT = ENV.fetch 'PROJECT_ID', "my-project-name"
OUTPUT_DIR = "out"
IMAGE_PROMPT = "Once upon a time, there was a young spy named Agent X. Agent X was the best spy in the world, and she was always on the lookout for new mysteries to solve. One day, Agent X was sent on a mission to investigate a mysterious cave at the bottom of a mountain."

require "base64"
require "fileutils"
require "google/apis/aiplatform_v1"

client = Google::Apis::AiplatformV1::AiplatformService.new
client.root_url = "https://us-central1-aiplatform.googleapis.com/"
client.authorization = Google::Auth.get_application_default

request = Google::Apis::AiplatformV1::GoogleCloudAiplatformV1PredictRequest.new \
  instances: [
    {
      prompt: IMAGE_PROMPT
    }
  ],
  parameters: {
    sampleImageSize: "1024",
    sampleCount: 8,
    aspectRatio: "9:16",
    negativePrompt: "blurry"
  }
response = client.predict_project_location_publisher_model \
  "projects/#{PROJECT}/locations/us-central1/publishers/google/models/imagegeneration@002",
  request

FileUtils.mkdir_p OUTPUT_DIR
response.predictions.each_with_index do |prediction, index|
  if prediction["mimeType"] == "image/png"
    image_data = Base64.decode64 prediction["bytesBase64Encoded"]
    filename = "#{OUTPUT_DIR}/image-#{index}.png"
    File.write filename, image_data
    puts "Wrote #{filename}"
  end
end