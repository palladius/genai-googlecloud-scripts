#!/usr/bin/env bundle exec ruby

# Use `bundle exec irb` for IRB :)
# gem pristine psych --version 5.1.0

require 'dotenv/load'
require 'langchainrb' # this wont work, Andrei!
#require '~/git/langchainrb-pr513/lib/langchain.rb'
#require 'json'
require 'httparty'
require 'colorize'

# PALM_API_KEY_GEMINI
puts("Key 🔐 PALM_API_KEY_GEMINI: #{ENV['PALM_API_KEY_GEMINI']}")
puts("Key 🔐 GOOGLE_GEMINI_API_KEY: #{ENV['GOOGLE_GEMINI_API_KEY']}")
puts("Key 🔐 SA_KEY: #{ENV['SA_KEY']}")
puts("Key 🔐 GOOGLE_APPLICATION_CREDENTIALS: #{ENV['GOOGLE_APPLICATION_CREDENTIALS']}")
puts("Key 🔐 NEWS_API_KEY: #{ENV['NEWS_API_KEY']}")


ENV['GOOGLE_GEMINI_API_KEY'] ||= ENV['PALM_API_KEY_GEMINI']
gemini_key = ENV["PALM_API_KEY_GEMINI"]
openai_key = ENV["OPENAI_API_KEY"]
raise "Missing gemini_key: '#{gemini_key}'" unless gemini_key.to_s.length > 10
raise "Missing openai_key: '#{openai_key}'" unless openai_key.to_s.length > 10

puts("👼🏽 gemini_key: #{gemini_key}")
puts("👹 openai_key: #{openai_key}")

#llm = Langchain::LLM::GoogleGemini.new(api_key: gemini_key)
llm = Langchain::LLM::OpenAI.new(api_key: openai_key)
puts("LLM: #{llm}")
thread = Langchain::Thread.new

news_assistant = Langchain::Tool::NewsRetriever.new(api_key: ENV["NEWS_API_KEY"])
assistant = Langchain::Assistant.new(
  llm: llm,
  thread: thread,
  instructions: "You are a News Assistant.",
  tools: [news_assistant]
)

ret = assistant.add_message_and_run content: "What are the latest news from Verona (Italy)?", auto_tool_execution: true
#puts(ret)
ret.each_with_index do |oai_msg, ix|
  puts("[Msg ##{ix.to_s.colorize :yellow}:] #{oai_msg.to_s.colorize :cyan}")
# Rhis is an Array of Langchain::Messages, eg Langchain::Messages::OpenAIMessage
end
