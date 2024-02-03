#! /usr/bin/env ruby

require 'gemini-ai'
require_relative 'lib/common'

# With an API key
# client = Gemini.new(
#   credentials: {
#     service: 'generative-language-api',
#     api_key: ENV['GOOGLE_API_KEY']
#   },
#   options: { model: 'gemini-pro', server_sent_events: true }
# )

# With a Service Account Credentials File
# client = Gemini.new(
#   credentials: {
#     service: 'vertex-ai-api',
#     file_path: 'google-credentials.json',
#     region: 'us-east4'
#   },
#   options: { model: 'gemini-pro', server_sent_events: true }
# )

# With Application Default Credentials
client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    region: 'us-central1',
    project_id: auto_project_id()
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)

result = client.stream_generate_content({
  contents: { role: 'user', parts: { text: 'hi!' } }
})
#puts result.class
present_gemini_result(result, debug: true)
# result.each_with_index do |partial_result, ir|
#   puts "== Result #{ir+1} =="
#   candidates=partial_result['candidates']
#   #puts candidates
#   candidates.each_with_index do |candidate, ic|
#     puts "+ Candidate #{ic+1} =="
#     #puts candidate
#     content = candidate['content']
#     # => {"role"=>"model", "parts"=>[{"text"=>"Hello! How can I assist you today?"}]}
#     puts "[#{content['role']}] 🟠 #{content['parts'].map{|x| x['text']}.join("\n 🟠")}"
#   end
#   #puts content
# end
result = client.stream_generate_content({
  contents: { role: 'user', parts: { text: 'Why is the sky blue?' } }
})
present_gemini_result(result, debug: false)
