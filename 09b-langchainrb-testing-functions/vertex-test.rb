#!/usr/bin/env bundle exec ruby

require 'dotenv/load'

#puts(" 🔵🟡🔴🟢 requiring LANGCHIANRB..")
EMAIL_ACCOUNT = ENV.fetch 'EMAIL_ACCOUNT', 'your-email@gmail.com'
command_to_fix_auth = "gcloud auth application-default login #{EMAIL_ACCOUNT}"
puts(" 🔵 🟡 🟨 🟡 🔴 🟢 requiring LANGCHAINRB.. make sure you do #{command_to_fix_auth} beforehand,,")

# module Langchain::LLM
#   class GoogleVertexAiResponse # < BaseResponse
#     def content
#       '[♊️] ' + completions.join('AAA\n')
#     end
#   end
# end


#require '~/git/langchainrb-pr513/lib/langchain.rb'
require 'langchainrb'

#ENV['GOOGLE_GEMINI_API_KEY'] ||= ENV['PALM_API_KEY_GEMINI']
gemini_key = ENV["PALM_API_KEY_GEMINI"]
project_id = ENV.fetch "GOOGLE_VERTEX_AI_PROJECT_ID"
raise "🔴[fatal] Missing 🌱 GOOGLE_VERTEX_AI_PROJECT_ID" if project_id.nil?
raise "🔴[fatal] Missing 🌱 PALM_API_KEY_GEMINI" if gemini_key.nil?
 puts "🟡[warn]  Missing 🌱 EMAIL_ACCOUNT" if ENV.fetch('EMAIL_ACCOUNT').nil?


puts("🔵🟡🔴🟢 Google Creds: #{ENV['GOOGLE_APPLICATION_CREDENTIALS']}")
puts("🔵🟡🔴🟢 Google project id: #{project_id}")
puts("🔑 Palm Key: #{ENV['PALM_API_KEY_GEMINI']}")


#llm = Langchain::LLM::GoogleGemini.new(api_key: gemini_key)

#llm = Langchain::LLM::GooglePalm.new(api_key: ENV["GOOGLE_PALM_API_KEY"]) # , default_options: { ... })
google_vertex = Langchain::LLM::GoogleVertexAi.new(
  project_id: project_id,
  default_options: { region: "us-central1", }
)

puts("LLM google_vertex: #{google_vertex}")

# google_vertex.embed text: 'ciao'
begin
  answer = google_vertex.complete prompt: 'Ciao da me che so'
#puts answer.raw_response.predictions[0]['content']
# function added by Riccardo in
  puts answer.completions
rescue Google::Apis::AuthorizationError => e
  puts("GCP Aiuth issue, try this command: #{command_to_fix_auth}")
rescue Exception  => e
  puts("Caught Exception, probably auth: #{e.class}")
rescue => err
  puts("All other errors, probably auth: #{e}")

end
