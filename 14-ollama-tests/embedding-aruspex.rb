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
puts("Embedding[0] class: #{arr_embeddings[0].class}")
avg = 0
sigma2 = 0
arr_embeddings.each {|f|
  avg += f
  sigma2 += f*f
}
avg = avg/(arr_embeddings.size)
sigma2 = sigma2/(arr_embeddings.size)
puts("Average: #{avg}")
puts("Sigma2: #{sigma2}")

#puts arr_embeddings
