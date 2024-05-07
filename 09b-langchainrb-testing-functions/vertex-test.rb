#!/usr/bin/env ruby

require '~/git/langchainrb-pr513/lib/langchain.rb'


#ENV['GOOGLE_GEMINI_API_KEY'] ||= ENV['PALM_API_KEY_GEMINI']
puts("Key: #{ENV['PALM_API_KEY_GEMINI']}")
gemini_key = ENV["PALM_API_KEY_GEMINI"]
project_id = ENV.fetch "GOOGLE_VERTEX_AI_PROJECT_ID", 'ricc-genai'

#llm = Langchain::LLM::GoogleGemini.new(api_key: gemini_key)

#llm = Langchain::LLM::GooglePalm.new(api_key: ENV["GOOGLE_PALM_API_KEY"]) # , default_options: { ... })
google_vertex = Langchain::LLM::GoogleVertexAi.new(project_id: project_id)
puts("LLM google_vertex: #{google_vertex}")
