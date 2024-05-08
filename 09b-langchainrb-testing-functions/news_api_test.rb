#!/usr/bin/env bundle exec ruby

# -> bundle exec ruby news_api_test.rb
# Andrei doesnt user RBENV but he uses ASDF
# This works: bundle exec ruby news_api_test.rb

require 'dotenv/load'

#require '~/git/langchainrb-pr513/lib/langchain.rb' # Tgus wirjs
require 'langchainrb' #this doesnt

require 'colorize'
require 'uri'
require 'net/http'
require 'json'

news_api_key = ENV.fetch 'NEWS_API_KEY', nil
puts("Key 🔐 NEWS_API_KEY: #{news_api_key}")
raise 'no key in env!' if news_api_key.nil?

news_queries = [
  'global warming',
  'Italian politics',
  'Trump vs Biden',
  'Carlesso',
]
news_query = news_queries.sample

def print_fancy_article(article)
  date = article['publishedAt'].to_s[0..9]
  title = article['title']
  author = article['author'].to_s
  comma_author = author.length > 1 ? "#{author.colorize :white}, from " : ''
  newspaper = article['source']['name']
  url = article['url']
  puts("📰 #{date} #{title.colorize :yellow} (#{comma_author}#{newspaper.colorize :blue}) # #{url.colorize :gray}")
end

# NEWS_API_KEY
news = Langchain::Tool::NewsRetriever.new(api_key: ENV["NEWS_API_KEY"])
str_result = news.get_everything(
  q: news_query ,
  #n: 7,
)
result =  JSON.parse(str_result)
#puts "Result keys: #{result.keys}"
puts("Query: '#{news_query.colorize :green}'")
puts "Result status: #{result['status']}"
puts "Retrieved: #{result['articles'].count} / #{result['totalResults']}"
result['articles'].each_with_index do |article, ix|
  #puts "🥶 Result article #ix: #{article}"
  print_fancy_article(article)
end
