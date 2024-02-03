#!/usr/bin/env ruby
# frozen_string_literal: true
#!/usr/bin/env ruby
# frozen_string_literal: true

# From: https://github.com/andreibondarev/langchainrb/blob/main/README.md#Assistants

require 'dotenv'
# require 'dotenv/load'
require 'langchainrb'
require 'google-apis-aiplatform_v1'

require_relative 'lib/gemini-request'

# put the key under .envrc
Dotenv.load('.envrc')

# $DEBUG = true

GOOGLE_VERTEX_AI_PROJECT_ID = ENV['GOOGLE_VERTEX_AI_PROJECT_ID']
# GOOGLE_VERTEX_AI_LOCATION = ENV['GOOGLE_VERTEX_AI_LOCATION']
# GOOGLE_VERTEX_AI_MODEL_ID = ENV['GOOGLE_VERTEX_AI_MODEL_ID']

MyPrompt = 'What is the meaning of life?'

# def langchain_prompt_test(project_id: )
#   llm = Langchain::LLM::GoogleVertexAi.new(project_id: project_id,
#                                            default_options: { temperature: 0.5 })

#   # assistant = Langchain::Assistants::LLM.new(llm)
#   prompt = Langchain::Prompt::PromptTemplate.new(template: 'Tell me a {adjective} joke about {content}.',
#                                                  input_variables: %w[
#                                                    adjective content
#                                                  ])
#   prompt.format(adjective: 'funny', content: 'chickens') # "Tell me a funny joke about chickens."
#   prompt.save(file_path: './prompt_template.json')

#   # $DEBUG = true
#   ret = llm.complete(prompt: MyPrompt).completion
#   puts('MyPrompt:', MyPrompt)

#   puts("Ret: #{ret}")
# end

def main
 # puts "DEBUG: GOOGLE_VERTEX_AI_PROJECT_ID: #{GOOGLE_VERTEX_AI_PROJECT_ID}"

  if GOOGLE_VERTEX_AI_PROJECT_ID.nil?
    raise 'please provide ENV[GOOGLE_VERTEX_AI_PROJECT_ID] and make sure you run: gcloud auth login'
  end

  # gemini_test

  gemini_request = GeminiRequest.new(project_id: GOOGLE_VERTEX_AI_PROJECT_ID, region: 'us-central1')

  puts "Gemini URI: #{gemini_request.uri}"
  puts "Gemini Object: #{gemini_request}"
  puts "Gemini Object: #{gemini_request.request}"

  puts 'done.'
  #langchain_prompt_test(project_id: GOOGLE_VERTEX_AI_PROJECT_ID)
end

main if __FILE__ == $PROGRAM_NAME
