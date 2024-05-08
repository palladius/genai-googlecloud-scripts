#!/usr/bin/env ruby

# This is from Gbaptista of course :)
require 'ollama-ai'

client = Ollama.new(
  credentials: { address: 'http://localhost:11434' },
 # credentials: { address: 'http://127.0.0.1:11434' },
  options: { server_sent_events: true }
)

result = client.generate(
  { model: 'llama3',
    prompt: 'Hi!' }
)

answer = result.map{|x| x['response']}.join ''
puts "Answer from 🦙 : #{answer}"

# Embeddings

result = client.embeddings(
  { model: 'llama3',
    prompt: 'Hi!' }
)
embedding = result[0]['embedding']
puts("Embedding result size: #{ embedding.size }")
puts("Embedding result first 5 els: #{ embedding[0..5].map{|x| x.round(2)} }, ..")
