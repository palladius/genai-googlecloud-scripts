#! /usr/bin/env ruby

require 'gemini-ai'
require_relative 'lib/common'
#require_relative '_env_gaic' # if you use GAIC

# python model for Gemini
# 1.0: model = GenerativeModel("gemini-1.0-pro-001")

# THIS WORKS! 'gemini-pro'
#GeminiModel = "gemini-1.0-pro-001" # This ALSO works, yay!
# GeminiModel = "gemini-1.0-ultra-001"
# Trying out... nope they wont work
#GeminiModel = "gemini-1.5-pro-001"
#GeminiModel = "gemini-2.0-pro-001"
#GeminiModel = "gemini-1.5" # 404
#GeminiModel = "gemini-1.5-pro-latest" # 404 https://github.com/google/generative-ai-python/issues/227
#GeminiModel = "gemini-1.5-pro-eval" # 404
#GeminiModel = "gemini-1.5-pro" # 404
GeminiModel = "gemini-1.5-pro-preview-0215" # 400 doesnt work

print("\n\n ♊️ Using GeminiModel=#{GeminiModel}\n ♊️ auto_project_id(): #{auto_project_id}\n\n")


# With Application Default Credentials
client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    region: 'us-central1',
    project_id: auto_project_id()
  },
  options: {
    model: GeminiModel,
    server_sent_events: true }
)

result = client.stream_generate_content({
  contents: {
    role: 'user',
    parts: { text: 'hi!' } }
})
present_gemini_result(result, debug: true)

# result = client.stream_generate_content({
#   contents: {
#     role: 'user',
#     parts: {
#       text: 'Can you write a little salutation to me like you were impersonating Marvin the Paranoid Android from the HitchHikers guide to the galazy from Douglas Adams? I would expect this to be pessimistic, vaguely rude and very humorous!'
#       } }
# })
print result
present_gemini_result(result, debug: false)
