#!/usr/bin/env ruby
# exec ruby

require 'dotenv/load'
#require '~/git/langchainrb-pr513/lib/langchain.rb'
require 'langchainrb'
require 'googleauth'
require 'google/cloud/storage'
require 'httparty'
# require "google/cloud/vertex_ai" hallucination

EMAIL_ACCOUNT = ENV.fetch 'EMAIL_ACCOUNT', 'your-email@gmail.com'
command_to_fix_auth = "gcloud auth application-default login #{EMAIL_ACCOUNT}"
puts(" 🔵 🟡 🟨 🟡 🔴 🟢 requiring LANGCHAINRB.. make sure you do #{command_to_fix_auth} beforehand,,")


#ENV['GOOGLE_GEMINI_API_KEY'] ||= ENV['PALM_API_KEY_GEMINI']
gemini_key = ENV["PALM_API_KEY_GEMINI"]
project_id = ENV.fetch "PROJECT_ID"
key_file_path = ENV['GOOGLE_APPLICATION_CREDENTIALS'] # '/Users/ricc/git/gic/private/ricc-genai.json'
#credentials = JSON.parse(File.read("path/to/key.json"))

raise "🔴[fatal] Missing 🌱 PROJECT_ID" if project_id.nil?
raise "🔴[fatal] Missing 🌱 PALM_API_KEY_GEMINI" if gemini_key.nil?
 puts "🟡[warn]  Missing 🌱 GOOGLE_APPLICATION_CREDENTIALS should do with ADC :)" if key_file_path.nil?
 puts "🟡[warn]  Missing 🌱 EMAIL_ACCOUNT" if ENV.fetch('EMAIL_ACCOUNT').nil?


puts("🔵🟡🔴🟢 ENV[GOOGLE_APPLICATION_CREDENTIALS]: #{ENV['GOOGLE_APPLICATION_CREDENTIALS']}")
puts("🔵🟡🔴🟢 Google project id: #{project_id}")
puts("🔑 Palm Key: #{ENV['PALM_API_KEY_GEMINI']}")



puts("Sample1: listing a bucket (project_id='#{project_id}')")

# Path to your service account key file
#llm = Langchain::LLM::GoogleGemini.new(api_key: gemini_key)
#llm = Langchain::LLM::GooglePalm.new(api_key: ENV["GOOGLE_PALM_API_KEY"]) # , default_options: { ... })
begin
  # Langchain::LLM::GoogleVertexAI not
  google_vertex = Langchain::LLM::GoogleVertexAI.new(
    project_id: project_id,
    region: "us-central1",
    default_options: { region: "us-central1", }
  )
  puts("LLM google_vertex: #{google_vertex}")

  #answer = google_vertex.complete prompt: 'Ciao da me che so, NON VA!'
  puts("Vertex methods: #{google_vertex.methods.sort}")
  summary = google_vertex.summarize text: 'Ciao da me che so'
  puts("summary: #{summary}")
  #embed = google_vertex.embed text: 'ciao'

#puts answer.raw_response.predictions[0]['content']
# function added by Riccardo in
  puts answer.completions
rescue Google::Apis::AuthorizationError => e
  puts("GCP Aiuth issue, try this command: #{command_to_fix_auth}")
rescue ArgumentError => e
  puts("ArgumentError sobenme. Error2 = #{e}")
rescue ArgumentError => e
  puts("NotImplementedError sobenme. Error2 = #{e}")
rescue RuntimeError => e
  puts("RuntimeError sobenme. Error2 = #{e}")
  puts e.backtrace.join("\n")
rescue Exception  => e
  puts("Caught generic Exception (class=#{e.class}). Error: '#{e}'")
rescue => err
  puts("All other errors, probably auth: #{e}")
end

# Gemini code for listing a buckt
## List a bucket
