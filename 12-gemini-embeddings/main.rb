#! /usr/bin/env ruby

#require 'google/auth'
#require 'google/apis/core' # (0.14.1)

# Testing auth with private/service account and GCS auth libraries thanks to Neha
# So I see if I can substitute the gcloud command when curling.


# GOOGLE_APPLICATION_CREDENTIALS environment variable to a JSON key file, you can load those credentials into a credentials object using the googleauth gem:
# authorization = Google::Auth.get_application_default

#ENV['GOOGLE_APPLICATION_CREDENTIALS'] = 'private/ricc-genai.json'

#service.authorization = Google::Auth.get_application_default

# export GOOGLE_APPLICATION_CREDENTIALS=private/ricc-genai.json

require 'google/apis/storage_v1'
require 'googleauth'

# **1. Set up authentication**

# Specify the path to your private key JSON file
#key_file = 'private.json'
key_file =  'private/ricc-genai.json'
# Load the credentials from the JSON file
auth = Google::Auth.get_application_default(key_file)

# Create a Google Cloud Storage service object
storage = Google::Apis::StorageV1::StorageService.new
storage.authorization = auth

puts "Riccardo Token: '#{storage.authorization.id_token}'"
# **2. Specify the bucket name**

bucket_name = 'genai_test_removeme'  # Replace with your actual bucket name
#gs://genai_test_removeme/

# **3. List the bucket's contents**

result = storage.list_objects(bucket_name) rescue nil #  "Some error"

puts "Riccardo Token aftewr calling RESULT: '#{storage.authorization.id_token}'"

result.items.each do |object|
  puts object.name
end if result

token = storage.authorization.id_token
PROJECT = 'ricc-genai'
command ="
    curl -X POST \
      -H \"Authorization: Bearer #{token}\" \
      -H \"Content-Type: application/json; charset=utf-8\" \
      \"https://us-central1-aiplatform.googleapis.com/v1/projects/#{PROJECT}/locations/us-central1/publishers/google/models/multimodalembedding@001:predict\" \
      -d '{ \"instance\": [ { \"text\": \"a cake\"} ] }' \
        > .tmp.ruby-text.json
  "
 #     "message":
 # "Request had invalid authentication credentials. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project.",

puts 'Issuing command via ruby and without gcloud..'
`#{command}`
puts 'done'
