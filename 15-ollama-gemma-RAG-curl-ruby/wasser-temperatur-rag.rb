#!/usr/bin/env ruby

require 'erb'
require 'date'
require_relative './curlit'
require 'open3' # For Open3.pipeline


# ./curlit.rb 'https://www.stadt-zuerich.ch/ssd/de/index/sport/schwimmen/wassertemperaturen.html' | tee .tmp-answer

# {{rag_from_website}}

def curlit(url:)
  extract_text_from_url(url:)
end


def substitute_with_rag(template_path:, rag_content:)
  # 1. Load the ERB Template

  template_content = File.read(template_path)


  erb_template = ERB.new(template_content)

  sample_variables = {
    #current_temperature: 18.5,  # Example temperature value
    date_today: Date.today,
    rag_from_website: rag_content, # 'TODO add here',
  }
  binding_object = binding
  sample_variables.each do |key, value|
      binding_object.local_variable_set(key, value)
  end

  # 5. Render the Template
  rendered_output = erb_template.result(binding_object)

  # 6. Display the Result
  #puts rendered_output
  rendered_output
end

# def pipe_into_gemma_broken(rendered_output:)
#   #
# #  Open3.pipeline("ollama", "run", "gemma") do |stdin, stdout, stderr, wait_thr|
#   last_stdout, wait_threads = Open3.pipeline("ollama run gemma") do |stdin, stdout, stderr, wait_thr|
#     stdin.puts 'ciao come va' # Send the rendered output to ollama
#     #stdin.puts rendered_output # Send the rendered output to ollama
#     stdin.close  # Signal end of input

#     # Handle output from ollama if needed
#     stdout.each_line { |line| puts("OUT: #{line}") }

#     # Handle errors if necessary
#     stderr.each_line { |line| warn line }

#     # Optionally, check the exit status
#     exit_status = wait_thr.value # Process::Status object
#     unless exit_status.success?
#         puts "ollama script exited with error: #{exit_status.exitstatus}"
#     end
#   end
#   last_stdout.close

# end

def pipe_into_gemma_capture(rendered_output:)
  Open3.capture3('ollama run gemma', stdin_data: rendered_output) do |stdout, stderr, status|
    if status.success?
      puts "Ollama output: #{stdout}" # Handle Ollama's output
    else
      warn "Ollama error: #{stderr}" # Handle any errors from Ollama
    end
  end
end
def pipe_into_gemma_popen(rendered_output:)
  IO.popen('ollama run gemma', 'r+') do |io|
    io.puts rendered_output     # Send data to Ollama
    io.close_write              # Signal end of input

    ollama_output = io.read     # Read Ollama's response
    puts ollama_output          # Process the response
    return ollama_output
  end
end

def save_output_as_json(json_output:, validation: 'TODO')
  # TODO if oyutput is {
  #      "Seebad Enge": "17°C",
  #      "Seebad Utoquai": "18°C",
  # }, then we're good.
  # if it has ```JSON ...``` then we remove it. if its still bad
  # also vaalidate that the temperature is between 0 centigrads and 40 centrigrads
  File.write('output.json', json_output)

end

def main()
  # get output frm website
  rag_content = curlit(url: 'https://www.stadt-zuerich.ch/ssd/de/index/sport/schwimmen/wassertemperaturen.html')
  rendered_output = substitute_with_rag(template_path: 'wasser-temperatur-rag.prompt.erb', rag_content:)
  #puts(rendered_output)
  #puts "⌛ Now lets wait for gemma to process it.. Capture"
  # TODO pipe this ioutput onyo ./wasser-temperatur-rag.rb | ollama run gemma
  #pipe_into_gemma(rendered_output:)
  puts "⌛ Now lets wait for gemma to process it.. popen"
  json_output = pipe_into_gemma_popen(rendered_output:)
  save_output_as_json(json_output:)
end


main
