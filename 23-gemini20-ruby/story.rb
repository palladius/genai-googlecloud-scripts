#!/usr.bin/env ruby

# Documented here: https://developers.googleblog.com/en/experiment-with-gemini-20-flash-native-image-generation/

#STORY_MODEL = "gemini-2.0-flash-exp-image-generation"
STORY_MODEL = "gemini-2.0-flash-exp"
#QUESTION = "What are the best Ruby gems for machine learning?"
QUESTION =  "Generate a story about a cute baby turtle in a 3d digital art style. " +
        "For each scene, generate an image."
require 'ruby_llm'

RubyLLM.configure do |config|
  config.gemini_api_key = ENV['GEMINI_API_KEY']
end

gemini_chat = RubyLLM.chat(model: STORY_MODEL)

print("Asking #{STORY_MODEL} this question: ```#{QUESTION}```...")
response = gemini_chat.ask QUESTION

print(response.content)
