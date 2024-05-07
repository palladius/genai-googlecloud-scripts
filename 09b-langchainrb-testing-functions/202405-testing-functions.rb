#!/usr/bin/env ruby

require 'dotenv/load'
#require 'langchainrb'
require '~/git/langchainrb-pr513/lib/langchain.rb'
require 'json'
require 'httparty'

# PALM_API_KEY_GEMINI
puts("Key 🔐 PALM_API_KEY_GEMINI: #{ENV['PALM_API_KEY_GEMINI']}")
puts("Key 🔐 GOOGLE_GEMINI_API_KEY: #{ENV['GOOGLE_GEMINI_API_KEY']}")
ENV['GOOGLE_GEMINI_API_KEY'] ||= ENV['PALM_API_KEY_GEMINI']
gemini_key = ENV["PALM_API_KEY_GEMINI"]
puts("gemini_key: #{gemini_key}")

llm = Langchain::LLM::GoogleGemini.new(api_key: gemini_key)
puts("LLM: #{llm}")
raise "Missing key: '#{gemini_key}'" unless gemini_key.to_s.length > 10
thread = Langchain::Thread.new
assistant = Langchain::Assistant.new(
  llm: llm,
  thread: thread,
  instructions: "You are a News Assistant.",
  tools: [Langchain::Tool::NewsRetriever.new(api_key: ENV["NEWS_API_KEY"])]
)

assistant.add_message_and_run content:"What are the latest news from China?", auto_tool_execution: true
