FILENAME = 'embeddings.txt'

def get_default_project_id()
    # PROJECT_ID="$(gcloud config get project)"
    # TODO CHANGE ME
    'ricc-genai'
end


def compute_embedding_bash(sentences, opts={})
    sent_0 = sentences[0].gsub('"','')
    sent_1 = sentences[1].gsub('"','')
    #export MODEL_ID="textembedding-gecko"
    project_id = opts.fetch :project_id, get_default_project_id()

    input_inject_content = ''
    sentences.each do |sentence|
        input_inject_content << "{ \"content\": \"#{sentence.gsub('"','') }\"}, "
    end
    # { "content": "#{sent_0}"},
    # { "content": "#{sent_0}"},
    # { "content": "#{sent_1}"},
  
    curl_command =  <<-CURL_COMMAND
    curl --silent \
    -X POST \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "Content-Type: application/json" \
    https://us-central1-aiplatform.googleapis.com/v1/projects/#{project_id}/locations/us-central1/publishers/google/models/textembedding-gecko:predict -d \
    $'{
      "instances": [
        #{input_inject_content}
      ],
    }'
    CURL_COMMAND
    #puts curl_command
    ret = `#{curl_command}` # exit 42
    File.open(FILENAME, 'w') { |file| file.write(ret) }
    puts("File written: #{FILENAME}")
    ret 
end

def compute_embeddings(sentences, opts={})
    opts_cache_file = opts.fetch :cache_file, false

    raise "Exception: I want an array of sentences for which to compute the embeddings" unless sentences.is_a?(Array)
    if File.exist?( FILENAME) and opts_cache_file
        puts 'File exists already!'
        File.read(FILENAME)
    else
        compute_embedding_bash(sentences, opts)     
    end
end