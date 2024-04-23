#!/usr/bin/env ruby

require 'json'

def Array
  def average
    #avg =
    #self.ap(&:to_f).inject(:+) / self.size
    #avg
    42
  end
end


$file = 'answer2-embeddings.nomic-embed-text.json'
# parse this JSON into a Hash
f = JSON.parse(File.read($file))
puts "Read file #{$file}"
arr_embeddings = f['embedding']

puts("Embedding size: #{arr_embeddings.size}")
puts("Embedding class: #{arr_embeddings.class}")
puts("Average: #{arr_embeddings.average}")

#puts arr_embeddings
