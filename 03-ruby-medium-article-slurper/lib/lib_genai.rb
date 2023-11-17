# This has a few utility functions for GenAI in Ruby.
module LibGenai

    require 'net/http'
    require 'uri'
    require 'googleauth'
    require_relative 'gcp_auth'

    include GcpAuth




    # Returns authenticated response for GenAI text backend
    def genai_text_predict_curl(content, opts={})
      opts_debug = opts.fetch :debug, false
      opts_max_content_size = opts.fetch :max_content_size, -1
      opts_verbose = opts.fetch :verbose, false
      opts_temperature = opts.fetch :temperature, false

      # Constants and vars
      model_id='text-bison'
      project_id, access_token = gcp_project_id_and_access_token()
      api_url =  "https://us-central1-aiplatform.googleapis.com/v1/projects/#{project_id}/locations/us-central1/publishers/google/models/#{model_id}:predict"
      
      # If I dont truncate, I get consistent errors. Possibly due to limitation in input tokens for the API.
      if opts_max_content_size > 0 
        truncated_content = content[0, opts_max_content_size] 
        puts "Truncating content to #{opts_max_content_size}B (original was #{content.size}B)" if opts_debug
      else 
        truncated_content = content
        puts "Keeping original content (size: #{content.size}B)" if opts_debug
      end

      url = URI.parse(api_url)

      puts("URL: #{url}") if opts_debug
  
      payload_hash = {
          "instances": [
              { "content": truncated_content },
          ],
          "parameters": {
              "candidateCount": 1, # TODO(ricc): investigate having more candidates!
              "temperature": opts_temperature,
              "maxOutputTokens": 2045, # safe: 1000. Max: 2048
              "topP": 0.9,
              "topK": 40
          }
      }
  
      # Create an HTTP object
      http = Net::HTTP.new(url.host, url.port)
      http.use_ssl = (url.scheme == 'https') # Enable SSL if the URL uses 'https'
  
      headers = {
        'Content-Type': 'application/json' ,
        "Authorization": "Bearer #{access_token}",
      }
  
      # Prepare the request
      response = Net::HTTP.post(url, payload_hash.to_json, headers)
   
      # Check the response and handle the result
      if response.code == '200'
        puts "🟢 API Response: 200 OK" #  Response body:
        puts response.body if opts_verbose
  
        json_body = JSON.parse(response.body)
        the_answer = json_body['predictions'][0]['content']
        #puts clever_metadata_tokens()
        # "metadata": {
        #   "tokenMetadata": {
        #     "outputTokenCount": {
        #       "totalTokens": 1973,
        #       "totalBillableCharacters": 5168
        #     },
        #     "inputTokenCount": {
        #       "totalBillableCharacters": 16200,
        #       "totalTokens": 5082
        #     }
        #   }
        tk_data =  json_body['metadata']['tokenMetadata']
        puts tk_data
        input_tokens = tk_data['inputTokenCount']['totalTokens'] #  # totalTokens in input
        output_tokens = tk_data['outputTokenCount']['totalTokens'] #  # totalTokens in output
        puts "TotalTokens: #{input_tokens} IN + #{output_tokens} OUT -> #{input_tokens+output_tokens} TOTAL (API_MAX=8192)"
        return the_answer
      else
        puts "🔴 API Request failed: #{response.code}"
        puts "#{response.code} Error message: #{response.message}"
        #puts response.inspect
        puts response.body # .error
        return nil
      end
    end




end

