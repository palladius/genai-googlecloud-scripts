#!/usr/bin/env ruby

require 'dotenv/load'
#require '~/git/langchainrb-pr513/lib/langchain.rb'
require 'langchainrb'
require 'uri'
require 'net/http'
require 'json'

puts("Key 🔐 NEWS_API_KEY: #{ENV['NEWS_API_KEY']}")

def print_fancy_article(article)
  date = article['publishedAt'].to_s[0..9]
  title = article['title']
  author = article['author']
  newspaper = article['source']['name']
  puts("🥶 #{date} '#{title}' (#{author}, from #{newspaper})")
end

# NEWS_API_KEY
news = Langchain::Tool::NewsRetriever.new(api_key: ENV["NEWS_API_KEY"])
str_result = news.get_everything q: 'Whats up with weather in the world?'
result =  JSON.parse(str_result)
#puts "Result keys: #{result.keys}"
puts "Result status: #{result['status']}"
puts "Retrieved: #{result['articles'].count} / #{result['totalResults']}"
result['articles'].each_with_index do |article, ix|
  #puts "🥶 Result article #ix: #{article}"
  print_fancy_article(article)
end
