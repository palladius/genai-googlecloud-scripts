#!/usr/bin/env ruby
# frozen_string_literal: true

#   Provides a library to curl websites.
# require 'open-uri'
# require 'nokogiri'
require 'net/http'
require 'action_view' # gem install actionview
# gem 'actionview', '~> 7.1', '>= 7.1.3.4'
#require 'html/sanitizer' # gem install html-sanitizer
VERSION = '0.9'

# Query: zürich wassertemperatur
# Available websites:
# 1. https://www.boot24.ch/chde/service/temperaturen/zuerichsee/
# 2. https://www.stadt-zuerich.ch/ssd/de/index/sport/schwimmen/wassertemperaturen.html
# TestZuri = 'https://www.stadt-zuerich.ch/ssd/de/index/sport/schwimmen/wassertemperaturen.html'
# 3. https://www.zh.ch/de/umwelt-tiere/wasser-gewaesser/messdaten/wassertemperaturen.html
#    This has imagery so it would be a GREAT example for image recognition (but it also has a table below).
# All lakes: https://www.badi-info.ch/wasser-temperaturen.html
#

def sanitize_html(html_string:)
  ActionView::Base.full_sanitizer.sanitize(html_string)
end

# This is done with Gemini. Still not the best implementation, but good enough for today.
# Remove JavaScript and any HTML tags (a bit aggressive, but customizable):
# text_content.gsub!(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i, '')
# text_content.gsub!(/<[^>]*>/, '')

def extract_text_from_url(url:, dump_to_file: true)
  # Fetches the page using Net::HTTP (a bit more robust than curl)
  response = Net::HTTP.get_response(URI(url))

  # Error handling: Check if we got a valid response.
  unless response.is_a?(Net::HTTPSuccess)
    raise "Failed to fetch content from #{url}: #{response.code} #{response.message}"
  end

  # Sanitize HTML, focusing on text content:
  # text_content = response.body

  text_content = sanitize_html html_string: response.body # text_content

  # Normalize whitespace for readability
  text_content.gsub!(/\s+/, ' ')

  if dump_to_file
    header = "# #{$PROGRAM_NAME} v#{VERSION} url=#{url}\n"
    File.write('.tmp.curlit.txt', header + text_content)
  end

  text_content
end

def main
  # Example usage
  raise 'Give me a URL as argument!' if ARGV.empty?

  url = ARGV[0] # "https://www.example.com"
  text = extract_text_from_url(url: url)
  puts text
end

if $PROGRAM_NAME == __FILE__
  main
  # else
  # puts "Thanks for INCLUDING me (#{__FILE__}), I suspect on IRB. Fa di me cio che vuoi."
end
