#!/usr/bin/env ruby

# This file is genai-embeddings-crunch.rb
#
# Before running, make sure you've done the following:
#     gem install google-apis-aiplatform_v1
#     gcloud auth application-default login
#
# Also, update the four constants below as needed.
#
# Then execute the file:
#     PROJECT_ID=your-real-project ./genai-embeddings-crunch.rb
#
# It will take embeddings generated inside the "out" directory
# and tell you what are the most similar to the FIRST one.

require 'json'
require 'yaml'

INPUT_DIR = "out"

require 'matrix'


# 5 Embeddings
AoA = [[]]
EmbeddingsMaxSize = 9 # 00 # TODO move back to 800ish




def main()
    embeddingsFiles = Dir.glob("#{INPUT_DIR}/embedding*.txt")
    parsedEmbeddings = []
    embeddingsFiles.each_with_index do |file, ix|
        human_index = ix+1
        puts file 
        h = File.read(file)
        #puts h.class
        #j = JSON.parse( h) # .gsub('=>', ':')
        prediction = eval(h) # insecure
        puts prediction.class
        #j = YAML.load h
        raise "Not a hash!" unless prediction.is_a? Hash
        
        puts "== Embedding##{human_index} ('#{file}') =="
        #puts "hash.keys: '#{prediction.keys}'"
        puts " - e.keys: '#{prediction[:embeddings].keys}'"
        #puts "Filename: '#{file}'"
        puts "Sentence: '#{prediction[:original_message]}'"
        puts "E Stats:  '#{prediction[:embeddings][:statistics]}'"
        puts "E.values: '#{prediction[:embeddings]['values']}'"
        puts "E.v size: '#{prediction[:embeddings]['values'].size}'"
        puts prediction.class
        puts prediction['embeddings'].keys
        #prediction = j['embeddings']
        AoA[ix] = Vector.send(:new,
            prediction['embeddings']['values'].pop(EmbeddingsMaxSize)
        )
    end
end

if $0 == __FILE__
    main
end