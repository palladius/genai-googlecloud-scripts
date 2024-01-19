#!/usr/bin/ruby


# From: https://github.com/andreibondarev/langchainrb/blob/main/README.md#Assistants

require 'dotenv'
#require 'dotenv/load'
require 'langchainrb'
require 'google_palm_api'

# put the key under .envrc
Dotenv.load('.envrc')

#$DEBUG = true


PALM_API_KEY = ENV['PALM_API_KEY']

def main

   puts "PALM_API_KEY: #{PALM_API_KEY}"
  raise "please provide ENV[PALM_API_KEY]" if PALM_API_KEY.nil?

  llm = Langchain::LLM::GooglePalm.new(api_key: ENV["GOOGLE_PALM_API_KEY"], default_options: { temperature: 0.5})

  #assistant = Langchain::Assistants::LLM.new(llm)
  prompt = Langchain::Prompt::PromptTemplate.new(template: "Tell me a {adjective} joke about {content}.", input_variables: ["adjective", "content"])
  prompt.format(adjective: "funny", content: "chickens") # "Tell me a funny joke about chickens."
  prompt.save(file_path: "./prompt_template.json")

  $DEBUG = true
  ret = llm.complete(prompt: "What is the meaning of life?").completion
  puts("Ret:", ret)

end



if __FILE__ == $PROGRAM_NAME
  main
end
