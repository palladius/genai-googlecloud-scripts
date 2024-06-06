#!/usr/bin/env ruby

=begin
  Provides a library to curl websites.
=end
#require 'open-uri'
#require 'nokogiri'
require 'net/http'

# Query: zürich wassertemperatur
# Available websites:
# 1. https://www.boot24.ch/chde/service/temperaturen/zuerichsee/
# 2. https://www.stadt-zuerich.ch/ssd/de/index/sport/schwimmen/wassertemperaturen.html
# TestZuri = 'https://www.stadt-zuerich.ch/ssd/de/index/sport/schwimmen/wassertemperaturen.html'
# 3. https://www.zh.ch/de/umwelt-tiere/wasser-gewaesser/messdaten/wassertemperaturen.html
#    This has imagery so it would be a GREAT example for image recognition (but it also has a table below).
# All lakes: https://www.badi-info.ch/wasser-temperaturen.html
#

# This is done with Gemini. Still not the best implementation, but good enough for today.
def extract_text_from_url(url:)
  # Fetches the page using Net::HTTP (a bit more robust than curl)
  response = Net::HTTP.get_response(URI(url))

  # Error handling: Check if we got a valid response.
  if response.is_a?(Net::HTTPSuccess)
    # Sanitize HTML, focusing on text content:
    text_content = response.body

    # Remove JavaScript and any HTML tags (a bit aggressive, but customizable):
    text_content.gsub!(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i, '')
    text_content.gsub!(/<[^>]*>/, '')

    # Normalize whitespace for readability
    text_content.gsub!(/\s+/, ' ')

    return text_content
  else
    raise "Failed to fetch content from #{url}: #{response.code} #{response.message}"
  end
end


def main()
  # Example usage
  raise "Give me a URL as argument!" if ARGV.size < 1

  url = ARGV[0] # "https://www.example.com"
  text = extract_text_from_url(url:)
  puts text
end

if $0 ==  __FILE__
  main
else
  # puts "Thanks for INCLUDING me (#{__FILE__}), I suspect on IRB. Fa di me cio che vuoi."
end
