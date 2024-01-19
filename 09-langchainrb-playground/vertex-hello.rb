#!/usr/bin/ruby


# From: https://github.com/andreibondarev/langchainrb/blob/main/README.md#Assistants

require 'dotenv'
#require 'dotenv/load'
require 'langchainrb'
require 'google-apis-aiplatform_v1'

# put the key under .envrc
Dotenv.load('.envrc')

#$DEBUG = true


PALM_API_KEY = ENV['PALM_API_KEY']
GOOGLE_VERTEX_AI_PROJECT_ID = ENV['GOOGLE_VERTEX_AI_PROJECT_ID']
# GOOGLE_VERTEX_AI_LOCATION = ENV['GOOGLE_VERTEX_AI_LOCATION']
# GOOGLE_VERTEX_AI_MODEL_ID = ENV['GOOGLE_VERTEX_AI_MODEL_ID']

MyPrompt =  "What is the meaning of life?"

def main

  puts "GOOGLE_VERTEX_AI_PROJECT_ID: #{GOOGLE_VERTEX_AI_PROJECT_ID}"
  raise "please provide ENV[GOOGLE_VERTEX_AI_PROJECT_ID] and make sure you run: gcloud auth login" if GOOGLE_VERTEX_AI_PROJECT_ID.nil?

  #llm = Langchain::LLM::GoogleVertexAi.new(api_key: ENV["GOOGLE_PALM_API_KEY"], default_options: { temperature: 0.5})
  llm = Langchain::LLM::GoogleVertexAi.new(project_id: ENV["GOOGLE_VERTEX_AI_PROJECT_ID"], default_options: { temperature: 0.5})

  #assistant = Langchain::Assistants::LLM.new(llm)
  prompt = Langchain::Prompt::PromptTemplate.new(template: "Tell me a {adjective} joke about {content}.", input_variables: ["adjective", "content"])
  prompt.format(adjective: "funny", content: "chickens") # "Tell me a funny joke about chickens."
  prompt.save(file_path: "./prompt_template.json")

  #$DEBUG = true
  ret = llm.complete(prompt: MyPrompt).completion
  puts("MyPrompt:", MyPrompt)

  puts("Ret: #{ret}")

end



if __FILE__ == $PROGRAM_NAME
  main
end
