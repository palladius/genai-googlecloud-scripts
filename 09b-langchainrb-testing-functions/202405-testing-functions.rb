#!/usr/bin/env ruby

require 'dotenv'
require 'langchainrb'

# PALM_API_KEY_GEMINI
ENV['GOOGLE_GEMINI_API_KEY'] ||= ENV['PALM_API_KEY_GEMINI']

llm = Langchain::LLM::GoogleGemini.new(api_key: ENV["GOOGLE_GEMINI_API_KEY"])
thread = Langchain::Thread.new
assistant = Langchain::Assistant.new(
  llm: llm,
  thread: thread,
  instructions: "You are a News Assistant.",
  tools: [Langchain::Tool::NewsRetriever.new(api_key: ENV["NEWS_API_KEY"])]
)

assistant.add_message_and_run content:"What are the latest news from China?", auto_tool_execution: true
