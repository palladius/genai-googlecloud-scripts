#! /usr/bin/env ruby

require 'gemini-ai'
require_relative 'lib/common'

###########
# Paptista addon

module Gemini
  module Controllers
    class Client

      def generate_content_riccardo(payload, server_sent_events: nil, &callback)
        result = request('generateContent', payload, server_sent_events:, &callback)

        return result.first if result.is_a?(Array) && result.size == 1

        result
      end

      def embed_content(payload, server_sent_events: nil, &callback)
        puts("Riccardo: payload = #{payload}")
    #     result = genai.embed_content(
    # model="models/embedding-001",
    # content="What is medium?",
    # task_type="retrieval_document",
    # title="Embedding of single string")

        result = request('predict', payload, server_sent_events:, &callback)
        puts("Riccardo: result = #{result}")
        return result.first if result.is_a?(Array) && result.size == 1

        result
      end

    end
  end
end

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
  options: {
    #model: 'gemini-pro',
#    model: "models/embedding-001",
    model: 'multimodalembedding@001', # this is the endpoint which works in bash.
    #model: "embedding-001",
    #model: "models/text-embedding-004",
    server_sent_events: true }
)

# result = client.generate_content_riccardo({
#   contents: { role: 'user', parts: { text: 'hi!' } }
# })
result = client.embed_content({
  content: 'blah '
  # contents: {
  #   content: 'blah',
  #   role: 'user', parts: {
  #     text: 'hi!',
  #     content: 'ciao',
  #      }
  #   }
})

# result = client.stream_generate_content({
#   contents: { role: 'user', parts: { text: 'hi!' } }
# })
puts result.class
puts(result) if result.is_a?(Hash)
#present_gemini_result(result, debug: true)
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
# result = client.stream_generate_content({
#   contents: { role: 'user', parts: { text: 'Why is the sky blue?' } }
# })
# present_gemini_result(result, debug: false)
