#!/usr/bin/env ruby

require 'net/http'
require 'nokogiri'
require 'action_view'

def init()
    Dir.mkdir('inputs/') rescue nil
    Dir.mkdir('outputs/') rescue nil
end

def fetch_from_medium(medium_user)
    medium_url = "https://medium.com/feed/@#{medium_user}"
    xml_response = Net::HTTP.get(URI(medium_url))
    File.open("inputs/medium-feed.#{medium_user}.xml", 'w') do |f|
        f.write xml_response
    end
    # deprecated 
    #publications = "https://api.medium.com/v1/users/#{medium_user}/publications?format=json"
    docSM = Nokogiri::XML(xml_response)
    # Looks like my articles are under many <content:encoded> tags, so here you go..
    docSM.xpath("//content:encoded").each_with_index do |node,ix|
        puts "* Article #{ix+1}:"
        puts ActionView::Base.full_sanitizer.sanitize(node.inner_text)
        puts ''
    end
end















def main()
    init()
    medium_user = ENV.fetch 'MEDIUM_USER_ID', 'palladiusbonton'
    fetch_from_medium(medium_user)
end

main()