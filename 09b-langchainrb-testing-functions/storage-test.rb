#!/usr/bin/env ruby

require 'dotenv/load'
#require '~/git/langchainrb-pr513/lib/langchain.rb'
require 'langchainrb'
require 'googleauth'
require 'google/cloud/storage'

EMAIL_ACCOUNT = ENV.fetch 'EMAIL_ACCOUNT', 'your-email@gmail.com'
command_to_fix_auth = "gcloud auth application-default login #{EMAIL_ACCOUNT}"
puts(" 🔵 🟡 🟨 🟡 🔴 🟢 requiring LANGCHAINRB.. make sure you do #{command_to_fix_auth} beforehand,,")


#ENV['GOOGLE_GEMINI_API_KEY'] ||= ENV['PALM_API_KEY_GEMINI']
gemini_key = ENV["PALM_API_KEY_GEMINI"]
project_id = ENV.fetch "PROJECT_ID"
key_file_path = ENV['GOOGLE_APPLICATION_CREDENTIALS'] # '/Users/ricc/git/gic/private/ricc-genai.json'

raise "🔴[fatal] Missing 🌱 PROJECT_ID" if project_id.nil?
raise "🔴[fatal] Missing 🌱 PALM_API_KEY_GEMINI" if gemini_key.nil?
 puts "🟡[warn]  Missing 🌱 GOOGLE_APPLICATION_CREDENTIALS should do with ADC :)" if key_file_path.nil?
 puts "🟡[warn]  Missing 🌱 EMAIL_ACCOUNT" if ENV.fetch('EMAIL_ACCOUNT').nil?


puts("🔵🟡🔴🟢 Google Creds: #{ENV['GOOGLE_APPLICATION_CREDENTIALS']}")
puts("🔵🟡🔴🟢 Google project id: #{project_id}")
puts("🔑 Palm Key: #{ENV['PALM_API_KEY_GEMINI']}")



puts("Sample1: listing a bucket (project_id='#{project_id}')")

# Path to your service account key file

# Configure Google Cloud Storage client with service account credentials
# storage = Google::Cloud::Storage.new(
#   project_id: project_id,
#   credentials: Google::Auth::ServiceAccountCredentials.make_creds(
#     scope: 'https://www.googleapis.com/auth/cloud-storage',
#     json_key_io: File.open(key_file_path)
#   )
# )

# https://cloud.google.com/ruby/docs/reference/google-cloud-storage/latest
if key_file_path
  storage = Google::Cloud::Storage.new(
    project_id: project_id,
    credentials: key_file_path,
  )
else
  puts("Missing creds - hoping in ADC.")
  storage = Google::Cloud::Storage.new(
    project_id: project_id,
  )
end

# List all buckets in your project
buckets = storage.buckets

# Print bucket names
puts "🪵 Buckets in your project:"
buckets.each { |bucket|
  puts bucket.name
}
