#!/usr/bin/env ruby

puts(" 🔵 🟡 🔴 🟢 requiring LANGCHIANRB..")

#require '~/git/langchainrb-pr513/lib/langchain.rb'
require 'langchainrb'

#ENV['GOOGLE_GEMINI_API_KEY'] ||= ENV['PALM_API_KEY_GEMINI']
gemini_key = ENV["PALM_API_KEY_GEMINI"]
project_id = ENV.fetch "GOOGLE_VERTEX_AI_PROJECT_ID", 'ricc-genai'

puts("🔵🟡🔴🟢 Google Creds: #{ENV['GOOGLE_APPLICATION_CREDENTIALS']}")
puts("🔵🟡🔴🟢 Google project id: #{project_id}")
puts("🔑 Palm Key: #{ENV['PALM_API_KEY_GEMINI']}")


#llm = Langchain::LLM::GoogleGemini.new(api_key: gemini_key)

#llm = Langchain::LLM::GooglePalm.new(api_key: ENV["GOOGLE_PALM_API_KEY"]) # , default_options: { ... })
google_vertex = Langchain::LLM::GoogleVertexAi.new(
  project_id: project_id,
  default_options: {},
#  default_options: { region: "us-central1", }
)

puts("LLM google_vertex: #{google_vertex}")
