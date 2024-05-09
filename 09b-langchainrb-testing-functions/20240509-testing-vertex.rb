#!/usr/bin/env bundle exec ruby

# Use `bundle exec irb` for IRB :)
# bundle exec ruby 20240509-testing-vertex.rb

 require 'dotenv/load'
 require 'langchainrb' # this wont work, Andrei!
 #require '~/git/langchainrb-pr513/lib/langchain.rb'
 require 'json'
 require 'httparty'
 require 'colorize'

 puts("Key 🔐 PALM_API_KEY_GEMINI: #{ENV['PALM_API_KEY_GEMINI']}")
 puts("Key 🔐 GOOGLE_GEMINI_API_KEY: #{ENV['GOOGLE_GEMINI_API_KEY']}")
 puts("Key 🔐 SA_KEY: #{ENV['SA_KEY']}")
 puts("Key 🔐 GOOGLE_APPLICATION_CREDENTIALS: #{ENV['GOOGLE_APPLICATION_CREDENTIALS']}")
 puts("Key 🔐 NEWS_API_KEY: #{ENV['NEWS_API_KEY']}")

 raise "No SA_KEY credentials" if ENV["SA_KEY"].nil?
 raise "No GOOGLE_VERTEX_AI_PROJECT_ID" if ENV["GOOGLE_VERTEX_AI_PROJECT_ID"].nil?

 project_id = ENV["GOOGLE_VERTEX_AI_PROJECT_ID"]
 puts("+ Cloud project_id: #{project_id}")

llm = Langchain::LLM::GoogleVertexAI.new(
  project_id: project_id,
  region: "us-central-1",
  #credentials:  ENV["SA_KEY"],
  )
puts(llm)
puts(llm.authorizer)
puts("Riccado @authorizer.methods  = #{llm.authorizer.methods.sort.join(', ').colorize :yellow}")

thread = Langchain::Thread.new

assistant = Langchain::Assistant.new(
  llm: llm,
  thread: thread,
  instructions: "You are a News Assistant.",
  tools: [Langchain::Tool::NewsRetriever.new(api_key: ENV["NEWS_API_KEY"])]
)

# This errors
assistant.add_message_and_run content: "What are the latest news from Italy?", auto_tool_execution: true
