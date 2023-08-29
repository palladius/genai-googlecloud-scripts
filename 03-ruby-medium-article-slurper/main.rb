#!/usr/bin/env ruby

require 'net/http'
require 'nokogiri'
require 'action_view'
require 'googleauth'

require_relative 'lib/lib_genai'
require_relative 'lib/gcp_auth'

MaxByteInputSize = 16000

Prompt = <<-END_OF_PROMPT
Provide a summary for each of the following articles.

* Please write about the topics, the style, and rate the article from 1 to 10 in terms of accuracy or professionalism.
* Please also tell me, for each article, whether it talks about Google Cloud.
* Can you guess the nationality of the person writing all of these articles?
* If you can find any typos or visible mistakes, please write them down.

--

END_OF_PROMPT

def init()
    Dir.mkdir('inputs/') rescue nil
    Dir.mkdir('outputs/') rescue nil
end

def fetch_from_medium(medium_user, _opts={})
    opts_refetch_if_exists = _opts.fetch :refetch_if_exists, false
    xml_filename = "inputs/medium-feed.#{medium_user}.xml"
    genai_input_filename = "inputs/medium-latest-articles.#{medium_user}.txt"

    if File.exist?(genai_input_filename) and (not opts_refetch_if_exists )
        puts "File '#{genai_input_filename}' already exists.. wont reparse"
        return nil 
    end 

    # Downloading the file and iterating through article parts.
    medium_url = "https://medium.com/feed/@#{medium_user}"
    xml_response = Net::HTTP.get(URI(medium_url))
    File.open(xml_filename, 'w') do |f|
        f.write xml_response
    end
    # deprecated 
    #publications = "https://api.medium.com/v1/users/#{medium_user}/publications?format=json"
    docSM = Nokogiri::XML(xml_response)

    
    # Looks like my articles are under many <content:encoded> tags, so here you go..
    File.open(genai_input_filename, 'w') do |file| # file.write("your text") }
        docSM.xpath("//content:encoded").each_with_index do |node,ix|
            # puts "* Article #{ix+1}:"
            # puts ActionView::Base.full_sanitizer.sanitize(node.inner_text)
            # puts ''
            file.write("* Article #{ix+1}:\n")
            file.write(ActionView::Base.full_sanitizer.sanitize(node.inner_text))
            file.write("\n---\n")
        end
    end
    return true
end

def call_api_for_all_texts(_opts={})
    opts_overwrite_if_exists = _opts.fetch :overwrite_if_exists, false

    Dir.glob("inputs/medium-latest-articles.*.txt") do |my_text_file|
        puts "Working on: #{my_text_file}..."
        output_file = "outputs/" + my_text_file.split('/')[1]
        genai_input = Prompt + "\n" + File.read(my_text_file)

        if opts_overwrite_if_exists and File.exist?(output_file)
            puts "File exists, skipping: #{output_file}"
            next 
        end 

        puts "== INPUT BEGIN: =="
        #puts genai_input
        puts "== INPUT END =="
        puts "== OUTPUT BEGIN: =="
        include LibGenai
        output = genai_text_predict_curl(genai_input, max_content_size: MaxByteInputSize)
        File.open(output_file, 'w') do |f|
            f.write output
        end
        puts "== OUTPUT END (written on: #{output_file}) =="
        
        #exit 42
        # Call API for summarization: https://cloud.google.com/vertex-ai/docs/generative-ai/text/summarization-prompts
    end
end


def main()
    init()
    #medium_user = ENV.fetch 'MEDIUM_USER_ID', 'iromin' ##'palladiusbonton'
    #fetch_from_medium(medium_user)
    call_api_for_all_texts()
    #puts('Please check your inputs/ directory for information I gave in input to GenAI and outputs/ for the GenAI Text output.')
    #include GcpAuth
    
    #x = gcp_project_id_and_access_token() # .join(' , ')
    #pr,at = x[0], x[1]
    #puts "x.class='#{x.class}' pr='#{pr}' at='#{at}'"
end

main()