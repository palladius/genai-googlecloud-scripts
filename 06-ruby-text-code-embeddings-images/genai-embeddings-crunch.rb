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
require_relative 'lib/lib_matrix'


# 5 Embeddings
AoA = [[]]
EmbeddingsMaxSize = 800 # 00 # TODO move back to 800ish

def createSquareMatrix(aoa)
    n = aoa.size # eg, 5 sentences
    m = Matrix.build(n,n) { 0 } #  Array.new(5) { Array.new(5, 0) }
    (0..n-1).each do |i|
        (0..n-1).each do |j|
            m[i,j] = AoA[i].inner_product(AoA[j])
        end
    end
    m
end

def cleaned_up_value_for(float_number) 
    sprintf("%.1f", (float_number*100).to_s)
end

def main()
    embeddingsFiles = Dir.glob("#{INPUT_DIR}/embedding*.txt")
    parsedEmbeddings = []
    sentences = []
    n_files = embeddingsFiles.size
    embeddingsFiles.each_with_index do |file, ix|
        human_index = ix+1
        #puts file 
        h = File.read(file)
        #puts h.class
        #j = JSON.parse( h) # .gsub('=>', ':')
        prediction = eval(h) # insecure
        #puts prediction.class
        #j = YAML.load h
        raise "Not a hash!" unless prediction.is_a? Hash
        
        #puts "== Parsed Embedding##{human_index} ('#{file}') =="
        #puts "hash.keys: '#{prediction.keys}'"
        #puts " - e.keys: '#{prediction['embeddings'].keys}'"
        #puts "Filename: '#{file}'"
        #puts "Sentence: '#{prediction['original_message']}'"
        sentences[ix] = prediction['original_message']
        msg_excerpt = prediction['original_message'].gsub("\n",' ')[0,70] # .first(50)
        puts "*  Embedding##{human_index}: #{msg_excerpt}"
        #puts "E Stats:  '#{prediction['embeddings']['statistics']}'"
#        puts "E.v size: '#{prediction['embeddings']['values'].size}'"
        #puts prediction.class
        #puts prediction['embeddings'].keys
        #prediction = j['embeddings']
        AoA[ix] = Vector.send(:new,
            prediction['embeddings']['values'].pop(EmbeddingsMaxSize)
        )
    end
    puts "AoA is now pretty big: should be 768 x #{n_files}. Let's now build a matrix of cross-correlation"
    correlation_matrix = createSquareMatrix(AoA)
    #pp correlation_matrix
    puts "\nCross-correlation matrix:"
    correlation_matrix.print_pct_readable

    # further calculations
    puts "Max index/value: #{ correlation_matrix.max_index } => #{ correlation_matrix.max_value }"
    cleaned_up_value = sprintf("%.1f", (correlation_matrix.max_value*100).to_s)
    puts "\nClosest friends are: #{ correlation_matrix.max_index } with #{cleaned_up_value}% correlation"
    first_ix = correlation_matrix.max_index[0] # .first
    second_ix = correlation_matrix.max_index[1] # .second
    puts "💚 #{first_ix+1}: #{sentences[first_ix]}"
    puts "💚 #{second_ix+1}: #{sentences[second_ix]}"

    puts "\nFartherst away enemies are: #{ correlation_matrix.min_index } with #{cleaned_up_value_for correlation_matrix.min_value}% correlation"
    
    puts "💔 #{correlation_matrix.min_index[0]+1}: #{sentences[correlation_matrix.min_index[0]]}"
    puts "💔 #{correlation_matrix.min_index[1]+1}: #{sentences[correlation_matrix.min_index[1]]}"


end

if $0 == __FILE__
    main
end