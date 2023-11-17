#!/usr/bin/env ruby

require 'net/http'
require 'nokogiri'
require 'action_view'
require 'googleauth'

require_relative 'lib/lib_genai'
require_relative 'lib/gcp_auth'

# Max size you can ingest from XML input.
# Safe value: 16000
# Ricc got errors with this: 32000
# With 30k it works, but then the output is VERY small. Better to save some for output as total size is 32k (I believe).
MaxByteInputSize = 23000

# Prompt = <<-END_OF_PROMPT
# Provide a summary for each of the following articles.

# * Please write about the topics, the style, and rate the article from 1 to 10 in terms of accuracy or professionalism.
# * Please also tell me, for each article, whether it talks about Google Cloud.
# * Can you guess the nationality of the person (or geographic context of the article itself) writing all of these articles?
# * If you can find any typos or visible mistakes, please write them down.

# --

# END_OF_PROMPT

### PROMPT HISTORY
Temperature = 0.2
PromptVersion = '1.7a'
ArticleMaxSize = 800
# 1.7 76nov23 Small nits, like parametrizing a few things. Removed movie, tried with book, removed it. Removed publication_date to make it shorter
# 1.6 16nov23 Removed typos from articles.
# 1.5 16nov23 Added movie.
# 1.4 16nov23 M oved from TXT to JSON!

PromptInJson = <<-END_OF_PROMPT
You are an avid article reader and summarizer. I'm going to provide a list of articles for a single author and ask you to do this:

1. For each article, I'm going to ask a number of per-article questions
2. Overall, I'm going to ask questions about the author.

I'm going to provide a JSON structure for the questions I ask. If you don't know some answer, feel free to leave NULL/empty values.

1. Per-article:

* Please write about the topics, the style, and rate the article from 1 to 10 in terms of accuracy or professionalism.
* Tell me, for each article, whether it talks about Google Cloud and/or if it's technical.
* For each article, capture the original title and please produce a short 300-500-character summary.
* What existing song would this article remind you the most of? Try a guess, use your fantasy. Please do NOT leave this null!

2. Overall (author):

* Extract name and surname
* Guess the nationality of the person.
* Please describe this author style. Is it professional or more personal? Terse or verbose? And so on.
* Does this author prefer a certain programming language? In which language are their code snippets (if any)? No frameworks, just languages.
* If you can find any typos or recurring mistakes in any article, please write them here. Not more than 3, just the most important.

Please provide the output in a `JSON` file as an array of answer per article, like this:

{
    "prompt_version": "#{PromptVersion}", // do NOT change this
    "llm_temperature": "#{Temperature}",   // do NOT change this
    "author_name": "", // name and surname of the author
    "author_nationality":  "", // nationality here
    "author_style": "",  // overall author style: is it professional or more personal? Terse or verbose? ..
    "author_favorite_languages": "blah, blah",  // which plain languages does the author use? Pascal? C++? Python? Java? Separate with commas.
    "typos": [{ // array of mistakes or typos, maximum THREE.
            "current": "xxx", // typo or mistake
            "correct": "yyy" // fixed typo
        }],
    "articles_feedback": [

        // article 1
        {
        "title": "",         // This should be the ORIGINAL article title, you should be able to extract it from the TITLE XML part, like "<title><![CDATA[What is toilet papers right side?]]></title>"
        "summary": "...",    // This should be the article summary produced by you.
        "url": "http://....", // Add here the article URL
        "accuracy": XXX,     // Integer 1 to 10
        "is_gcp": XXX,   // boolean, true of false
        "is_technical": XXX,   // boolean, true of false
        ] 
    },

        // Article 2, and so on..
    ]
}

Make **ABSOLUTELY SURE** the result is valid JSON (and NOT markdown) or I'll have to drop the result.

Here are the articles:

--

END_OF_PROMPT

def init()
    Dir.mkdir('inputs/') rescue nil
    Dir.mkdir('outputs/') rescue nil
end

# Monkey patching File class - I love Ruby!
class File
    def writeln(str); write(str+"\n"); end
end
class IO
    def writeln(str); write(str+"\n"); end
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


    num_items = docSM.xpath("//item").count

    puts("#Article items: #{num_items}")
    
    # Looks like my articles are under many <content:encoded> tags, so here you go..
    File.open(genai_input_filename, 'w') do |file| # file.write("your text") }
        ## Version 2: Scrape more important metadatsa

        # To change from fkile to stdout, uncomment the following line :)
        #file = $stdout

        docSM.xpath("//item").each_with_index do |node,ix| # Article
            file.writeln "\n====== Article #{ix+1} ====="
            title = node.xpath("title").inner_text
            creator = node.xpath("dc:creator").inner_text
            url =  node.xpath("link").inner_text
            pubDate =  node.xpath("pubDate").inner_text
            categories =  node.xpath("category").map{|c| c.inner_text}  # there's many, eg:  ["cycling", "google-forms", "data-studio", "pivot", "google-sheets"]
            article_content = ActionView::Base.full_sanitizer.sanitize(node.xpath('content:encoded').inner_text)[0, ArticleMaxSize]
            file.writeln "* Title: '#{title}'"
            file.writeln "* Author: '#{creator}'"
            file.writeln "* URL: '#{url}'"
            file.writeln "* PublicationDate: '#{pubDate}'"
            file.writeln "* Categories: #{categories.join(', ')}"
            file.writeln ""
            #file.writeln(node.to_s) # .inner_text   # LONG version
            file.writeln article_content    # SANITIZED version
        end

        #exit(42)

        ## Version 1: Just output the article body
        # docSM.xpath("//content:encoded").each_with_index do |node,ix| # ArticleBody
        #     # puts "* Article #{ix+1}:"
        #     # puts ActionView::Base.full_sanitizer.sanitize(node.inner_text)
        #     # puts ''
        #     file.write("* Article #{ix+1}:\n")
        #     file.write(ActionView::Base.full_sanitizer.sanitize(node.inner_text))
        #     file.write("\n---\n")
        # end
    end
    #exit 42
    return true
end

def call_api_for_single_user(medium_user)
    call_api_for_all_texts(single_user: medium_user)
end

def call_api_for_all_texts(_opts={})
    opts_overwrite_if_exists = _opts.fetch :overwrite_if_exists, false
    opts_single_user = _opts.fetch :single_user, nil

    Dir.glob("inputs/medium-latest-articles.*.txt") do |my_text_file|
        if opts_single_user
            #puts "DEB REMOVEME my_text_file: #{my_text_file}"
            next unless my_text_file == "inputs/medium-latest-articles.#{opts_single_user}.txt"
        end
        puts "Working on: #{my_text_file}..."
        output_file = "outputs/" + my_text_file.split('/')[1] + '.json'
        genai_input = PromptInJson + "\n" + File.read(my_text_file) + "\n\nJSON: "

        if opts_overwrite_if_exists and File.exist?(output_file)
            puts "File exists, skipping: #{output_file}"
            next 
        end 

        #puts "== INPUT BEGIN: =="
        #puts genai_input
        #puts "== INPUT END =="
        puts "== OUTPUT BEGIN: =="
        include LibGenai
        output = genai_text_predict_curl(genai_input, 
            max_content_size: MaxByteInputSize, 
            verbose: false,
            temperature: Temperature)
        File.open(output_file, 'w') do |f|
            f.write output
        end
        puts "== OUTPUT END (written on: #{output_file}) =="
        # https://stackoverflow.com/questions/42385036/validate-json-file-syntax-in-shell-script-without-installing-any-package
        valid_json_script = `cat '#{output_file}' | json_pp`
        ret = $?
        puts "Valid JSON? => #{ret}"
        
        #exit 42
        # Call API for summarization: https://cloud.google.com/vertex-ai/docs/generative-ai/text/summarization-prompts
    end
end


def main()
    init()
    medium_user = ENV.fetch 'MEDIUM_USER_ID', 'iromin' ##'palladiusbonton'
    fetch_from_medium(medium_user)
    #call_api_for_all_texts()
    call_api_for_single_user(medium_user)
    #puts('Please check your inputs/ directory for information I gave in input to GenAI and outputs/ for the GenAI Text output.')
    #include GcpAuth
    
    #x = gcp_project_id_and_access_token() # .join(' , ')
    #pr,at = x[0], x[1]
    #puts "x.class='#{x.class}' pr='#{pr}' at='#{at}'"
end

main()






=begin 

    Sample XML (in case it changes!)

    Every article looks like this: 
<item>
<title>
<![CDATA[ Migrate GCP projects across organizations, the gcloud way ]]>
</title>
<link>https://medium.com/google-cloud/how-to-migrate-projects-across-organizations-c7e254ab90af?source=rss-b5293b96912f------2</link>
<guid isPermaLink="false">https://medium.com/p/c7e254ab90af</guid>
<category>
<![CDATA[ gcp-security-operations ]]>
</category>
<category>
<![CDATA[ google-cloud-platform ]]>
</category>
<category>
<![CDATA[ migration ]]>
</category>
<dc:creator>
<![CDATA[ Riccardo Carlesso ]]>
</dc:creator>
<pubDate>Tue, 18 Apr 2023 13:16:26 GMT</pubDate>
<atom:updated>2023-05-12T10:14:07.124Z</atom:updated>
<content:encoded>
<![CDATA[ <p><em>Nel mezzo del cammin di nostra vita, <br>mi ritrovai per una selva oscura, 
   <br>ché la diritta via era smarrita”</em></p><p><em>— </em>Dante Alighieri(*), <a href="https://en.wikipedia.org/wiki/Divine_Comedy">Divine Comedy</a></p><p><em>(*) 
   the Italian version of Shakespeare, just better</em></p><p>Translated for non-🇮🇹: some day I was encouraged by some external entity to move a lot
    of projects from 5 of my organizations (<em>source</em>) to another organization (<em>destination</em>).</p><p><strong>TL;DR</strong> If you find 
    this article too long and you want to jump to the code, click on <a href="https://gist.github.com/palladius/a99993feb7e6d78b7a2abea0a10c3242">this 
    ....
    originally published in <a href="https://medium.com/google-cloud">Google Cloud - Community</a> on Medium, where people are continuing the conversation by highlighting and responding to this story.</p> ]]>
</content:encoded>
</item>

=end