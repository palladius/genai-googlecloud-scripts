#!/usr/bin/env bundle exec ruby
# encoding: utf-8

# Use `bundle exec irb` for IRB :)
# bundle exec ruby 20240509-testing-vertex.rb


 require 'dotenv/load'
 require 'langchainrb' # this wont work, Andrei!
 require 'json'
 require 'httparty'
 require 'colorize'

Encoding.default_external = Encoding::UTF_8
Verbose = true

#NewsQuery="What are the latest news from Italy?"
#NewsQuery="Find news on these four Crypto stocks: BTC, ETH, LTC, BCH"
# LTC: https://www.nasdaq.com/it/market-activity/stocks/ltc
# BCH: Banco de Chile (BCH)
NewsQueries = [
  "Latest headlines on Israel and Palestine, from BBC or CNN",
  "News on Israel and Palestine, from a European source",
  "News on Israel and Palestine, from BBC or CNN",
  "News on Israel and Palestine, from Al Jazeera",
  "Find news on BCH Crypto stock, from a south american country",
  "Find news on BCN Crypto stock, possibly in Italian",
  "Find news on ETH Crypto stock, possibly located in alpine countries (Switzerland and Austria)",
  "Find news on LTC Crypto stock, possibly located in a European country",
]
NewsQuery=NewsQueries.sample # "Find news on BCH Crypto stock"

puts("News querry: #{NewsQuery.colorize :green}")

class Langchain::Messages::GoogleGeminiMessage
  def to_s
    self.tool_calls.any? ?
      "🛠️[#{role}] #{self.tool_calls[0]['functionCall'].to_s.force_encoding("UTF-8") rescue $!}" :
      "💬[#{role}] #{self.content.force_encoding("UTF-8")}"
    #self.inspect # :status, :code, :messafe, ...
  end
end

 puts("Key 🔐 PALM_API_KEY_GEMINI: #{ENV['PALM_API_KEY_GEMINI']}")
 puts("Key 🔐 GOOGLE_GEMINI_API_KEY: #{ENV['GOOGLE_GEMINI_API_KEY']}")
 puts("Key 🔐 SA_KEY: #{ENV['SA_KEY']}")
 puts("Key 🔐 GOOGLE_APPLICATION_CREDENTIALS: #{ENV['GOOGLE_APPLICATION_CREDENTIALS']}")
 puts("Key 🔐 NEWS_API_KEY: #{ENV['NEWS_API_KEY']}")

 project_id = ENV.fetch "PROJECT_ID", 'ricc-genai'

# raise "No SA_KEY credentials" if ENV["SA_KEY"].nil?
puts "WARN: No GOOGLE_APPLICATION_CREDENTIALS credentials" if ENV["GOOGLE_APPLICATION_CREDENTIALS"].nil?
raise "No PROJECT_ID" if project_id.nil?

 project_id = ENV["PROJECT_ID"]
 puts("+ Cloud project_id: #{project_id}")

llm = Langchain::LLM::GoogleVertexAI.new(
  project_id: project_id,
  region: "us-central1", # ENV[GCLOUD_REGION]
  #credentials:  ENV["SA_KEY"],
  )
puts("+ llm: #{llm}")
#puts("+ LLLM URI: #{llm.uri}")
puts("+ authorizer: #{llm.authorizer}")
tok = llm.authorizer.fetch_access_token!
puts("+ token: #{tok}") if Verbose
raise "Riccardo: empty LLM GCP Auth token" if tok.nil?
#puts("+ Riccado @authorizer.methods  = #{llm.authorizer.methods.sort.join(', ').colorize :yellow}")

thread = Langchain::Thread.new

assistant = Langchain::Assistant.new(
  llm: llm,
  thread: thread,
  instructions: "You are a News Assistant.",
  tools: [Langchain::Tool::NewsRetriever.new(api_key: ENV["NEWS_API_KEY"])]
)

# This errors
ret = assistant.add_message_and_run content: NewsQuery, auto_tool_execution: true
puts("Ret is an Array of [Langchain::Messages::GoogleGeminiMessage]: #{ret.map{|x| x.class}}")

ret.each do |gemini_msg|
  #puts("[♊1] #{gemini_msg.content rescue $!}")
  puts("[♊2] #{gemini_msg.to_s rescue $!}")
end
