#!/usr/bin/env ruby
# frozen_string_literal: true

# From: https://github.com/andreibondarev/langchainrb/blob/main/README.md#Assistants

require 'dotenv'
# require 'dotenv/load'
require 'langchainrb'
require 'google_palm_api'

# put the key under .envrc
Dotenv.load('.envrc')

# $DEBUG = true

PALM_API_KEY = ENV['PALM_API_KEY']

def langchain_prompt_test
  llm = Langchain::LLM::GooglePalm.new(api_key: ENV['GOOGLE_PALM_API_KEY'], default_options: { temperature: 0.5 })
  prompt = Langchain::Prompt::PromptTemplate.new(template: 'Tell me a {adjective} joke about {content}.',
                                                 input_variables: %w[
                                                   adjective content
                                                 ])
  prompt.format(adjective: 'funny', content: 'chickens') # "Tell me a funny joke about chickens."
  prompt.save(file_path: './prompt_template.json')

  # enable verbosity you want here but not before..
  $DEBUG = true
  ret = llm.complete(prompt: 'What is the meaning of life?').completion
  puts('Ret:', ret)
end

def main
  puts "PALM_API_KEY: #{PALM_API_KEY}"
  raise 'please provide ENV[PALM_API_KEY]' if PALM_API_KEY.nil?

  langchain_prompt_test
end

main if __FILE__ == $PROGRAM_NAME
