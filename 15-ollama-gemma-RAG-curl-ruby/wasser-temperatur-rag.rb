#!/usr/bin/env ruby
# frozen_string_literal: true

require 'erb'
require 'date'
require_relative './curlit'
require 'open3' # For Open3.pipeline

SCRIPT_VERSION = '0.2'

# wrap included library
def curlit(url:)
  extract_text_from_url url: url
end

# Takes the prompt, and substitutes with some variables
def substitute_with_rag(template_path:, rag_content:)
  # 1. Load the ERB Template
  template_content = File.read(template_path)

  erb_template = ERB.new(template_content)

  sample_variables = {
    date_today: Date.today,
    rag_from_website: rag_content
  }
  sample_variables.each do |key, value|
    binding.local_variable_set(key, value)
  end

  # 5. Render the Template
  erb_template.result(binding_object)

  # 6. return the Result
end

# Uses `popen()` method - after trying and failing with others.
def pipe_into_gemma(rendered_output:)
  IO.popen('ollama run gemma', 'r+') do |io|
    io.puts rendered_output     # Send data to Ollama
    io.close_write              # Signal end of input

    ollama_output = io.read     # Read Ollama's response
    puts ollama_output          # Process the response
    return ollama_output
  end
end

# TODO: sanitization will go here
def save_sanitized_output_as_json(json_output:, file_name:)
  # TODO(ricc): if output is something like:
  # {
  #      "Seebad Enge": "17°C",
  #      "Seebad Utoquai": "18°C",
  # }, then we're good.
  # if it has ```JSON ...``` then we remove it. if its still bad
  # also vaalidate that the temperature is between 0 centigrads and 40 centrigrads
  File.write(file_name, json_output)
end

def main(verbose: true)
  # 1. get output frm website
  rag_content = curlit(url: 'https://www.stadt-zuerich.ch/ssd/de/index/sport/schwimmen/wassertemperaturen.html')
  # 2. renders the prompt with this information
  puts("RAG Content: '''#{rag_content}'''") if verbose

  rendered_output = substitute_with_rag(template_path: 'wasser-temperatur-rag.prompt.erb', rag_content: rag_content)
  # 3. Calling Ollama takes a while, better to tell the user they'll have to wait a bit
  puts '⌛ Now lets wait for gemma to process it..' if verbose
  # 4. why piping in bash when you can do it natively in ruby and manage errors here?
  json_output = pipe_into_gemma rendered_output: rendered_output
  # 5. Save onto JSON -> see
  save_sanitized_output_as_json(json_output: json_output, file_name: 'output.json')
end

main if $PROGRAM_NAME == __FILE__
