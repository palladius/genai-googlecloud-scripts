#! /usr/bin/env ruby

require 'gemini-ai'
require_relative 'lib/common'
require 'colorize'

chat_state = []

  # With Application Default Credentials
$client = Gemini.new(
    credentials: {
      service: 'vertex-ai-api',
      region: 'us-central1',
      project_id: auto_project_id()
    },
    options: { model: 'gemini-pro', server_sent_events: true }
  )


# result = client.stream_generate_content({
#   contents: { role: 'user', parts: { text: 'Why is the sky blue?' } }
# })
# present_gemini_result(result, debug: false)

# Lets start with autochat.
# https://cloud.google.com/vertex-ai/docs/generative-ai/chat/chat-prompts?hl=it#gemini-pro
def autochat
  puts 'Lets start with autochat. when it works we move to interactive (IRB-like) chat'
  user_messages = [
    'Hi! My name is Riccardo',
    'Who is the current President of United States?',
    'Wow! Thats so interesting! Tell me more about his wife',
  ]
  #$DEBUG = true
  request_avalanche_contents = []
  user_messages.each do |user_message|
    # Update avalanche with User Input
    request_avalanche_contents << { role: 'user', parts: { text: user_message } }
    # Call Gemini API
    result = $client.stream_generate_content({ contents: request_avalanche_contents })
    model_answer = gemini_result_to_string(result, debug: false)
    # Update avalanche with Bot output
    request_avalanche_contents << { role: 'model', parts: { text: model_answer } }

    #present_gemini_result(result, debug: true)
    puts "Q. 🙋‍♂️ #{user_message}".colorize(:color => :yellow, :mode => :bold)
    puts "A. ‼️ #{model_answer}".colorize(:color => :blue, :mode => :bold)
    puts request_avalanche_contents.to_s.colorize(:color => :gray) if $DEBUG
  end
  puts "End of chat :)"
end

# TODO add ability to automatically say "Hi" -> Adds to the magic.
def user_chat(first_message: 'Hi!')
  puts 'Lets now try interactive (IRB-like) chat via gets() -if its toop naive Ill use TTY gem'
  puts "Welcome to Gemini Chat (aka 'Bardolino'). Type 'ufwiederluege' to exit.".colorize(:color => :yellow, :mode => :bold)
  user_messages = []
  #$DEBUG = true
  request_avalanche_contents = []

  while (user_message=gets.chomp)
    puts("You gave me this: '#{user_message}' (length: #{user_message.length})") if $DEBUG
    user_messages << user_message
    break if user_message == 'ufwiederluege' or user_message == 'adieu' or user_message == ''
    # Update avalanche with User Input
    request_avalanche_contents << { role: 'user', parts: { text: user_message } }
    # Call Gemini API
    result = $client.stream_generate_content({ contents: request_avalanche_contents })
    model_answer = gemini_result_to_string(result, debug: false)
    # Update avalanche with Bot output
    request_avalanche_contents << { role: 'model', parts: { text: model_answer } }

    #present_gemini_result(result, debug: true)
    #puts "Q. 🙋‍♂️ #{user_message}".colorize(:color => :yellow, :mode => :bold)
    puts "[♊️] #{model_answer}".colorize(:color => :blue, :mode => :bold)
    puts request_avalanche_contents.to_s.colorize(:color => :gray) if $DEBUG
  end

  file_name = generate_transcript(request_avalanche_contents)

  puts('😘 I hope you enjoyed ♊️ Gemini API! Adieu.')
  puts("💾 Please find transcrprit in #{file_name}")

end


def main
  #autochat
  user_chat
end

main() if __FILE__ == $PROGRAM_NAME
