#!/usr/bin/env ruby

# This file is genai-embeddings-generate.rb
#
# Before running, make sure you've done the following:
#     gem install google-apis-aiplatform_v1
#     gcloud auth application-default login
#
# Also, update the four constants below as needed.
#
# Then execute the file:
#     PROJECT_ID=your-real-project ./genai-embeddings-generate.rb
#
# It will create a directory called "out" and write the embeddings text files there.
# They contain an array of N normalized variables, so it only makes visible sense
# when you create a scalar product among the two to see the similitude between 2 sentences.

PROJECT = ENV.fetch('PROJECT_ID', `gcloud config get core/project`.chomp)
OUTPUT_DIR = "out"
MODEL_ID = "textembedding-gecko" # @001
MESSAGES = [
    "Nel mezzo del cammin di nostra vita
    mi ritrovai per una selva oscura,
    ché la diritta via era smarrita.", # Divine comedy verse 1

    "Ahi quanto a dir qual era è cosa dura,
    esta selva selvaggia e aspra e forte,
    che nel pensier rinova la paura!", # Divine comedy verse 2

    "Cantami, o Diva, del Pelìde Achille
    l'ira funesta che infiniti addusse
    lutti agli Achei, molte anzi tempo all'Orco
    generose travolse alme d'eroi", # Ilyad, italian proemio

    #testing the double \" quote
    '"Thou, Nature, art my goddess"', # 7. Edmund in King Lear 1.2, “Thou, Nature, art my goddess”

    # https://en.wikipedia.org/wiki/To_be,_or_not_to_be - divided in 2:
    # verse 1
    "To be, or not to be, that is the question:",
    # verse 2-5    
    "Whether 'tis nobler in the mind to suffer
    The slings and arrows of outrageous fortune,
    Or to take Arms against a Sea of troubles,
    And by opposing end them: to die, to sleep",
]

# assert size is not more than 5 - i think its the limit

require "base64"
require "fileutils"
require "google/apis/aiplatform_v1"

def yellow(s)
  "\033[1;33m#{s}\033[0m"
end
client = Google::Apis::AiplatformV1::AiplatformService.new
client.root_url = "https://us-central1-aiplatform.googleapis.com/"
client.authorization = Google::Auth.get_application_default

# Array of hashes: [
#   {content: "foo"},
#   {content: "bar"},
#   {content: "baz"},
# ]

#ArrayOfContentHashes = MESSAGES.map{|message| {content: message.tr('"', "") }}
ArrayOfContentHashes = MESSAGES.map{|message| {content: message }}

request = Google::Apis::AiplatformV1::GoogleCloudAiplatformV1PredictRequest.new \
  instances: ArrayOfContentHashes

response = client.predict_project_location_publisher_model \
  "projects/#{PROJECT}/locations/us-central1/publishers/google/models/#{MODEL_ID}",
  request


FileUtils.mkdir_p OUTPUT_DIR
response.predictions.each_with_index do |prediction, index|
  puts "== Prediction #{index} =="
  puts "* Original Messages: #{yellow MESSAGES[index]}"
  puts "* Statistics: #{prediction['embeddings']['statistics']}"
  puts "* Dimensions: #{prediction['embeddings']['values'].size}"
  filename = "#{OUTPUT_DIR}/embedding-#{index}.txt"
  final_hash = {
    "embeddings" => prediction["embeddings"],
    "original_message" => MESSAGES[index],
  }
  #File.write filename, prediction["embeddings"]
  File.write filename, final_hash # adding both the output that the meaningful input for future reference / crunching.
  puts "* Wrote #{filename}"
  puts ""
end

