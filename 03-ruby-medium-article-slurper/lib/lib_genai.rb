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
              "temperature": 0.1,
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
        return the_answer
      else
        puts "🔴 API Request failed: #{response.code}"
        puts "#{response.code} Error message: #{response.message}"
        #puts response.inspect
        puts response.body # .error
        return nil
      end
    end

















    # # This works. Lets try the other one
    # def genai_text_curl(project_id, content, opts={})
    #     opts_debug = opts.fetch :debug, true # TODO(ricc): should be false before publication.
    #     opts_max_content_size = opts.fetch :max_content_size, -1

    #     # Constants and vars
    #     model_id='text-bison'
    #     api_url =  "https://us-central1-aiplatform.googleapis.com/v1/projects/#{project_id}/locations/us-central1/publishers/google/models/#{model_id}:predict"
        
    #     # If I dont truncate, I get consistent errors. Possibly due to limitation in input tokens for the API.
    #     if opts_max_content_size > 0 
    #       truncated_content = content[0, opts_max_content_size] 
    #       puts "Truncating content to #{opts_max_content_size}B (original was #{content.size}B)" if opts_debug
    #     else 
    #       truncated_content = content
    #       puts "Keeping original content (size: #{content.size}B)" if opts_debug
    #     end
    
    #     ENV['GOOGLE_APPLICATION_CREDENTIALS'] ||= 'secret.json'    
    #     key_file = File.expand_path(ENV.fetch('GOOGLE_APPLICATION_CREDENTIALS'))
        

    #     url = URI.parse(api_url)

    #     puts("URL: #{url}") if opts_debug
    #     puts("DEBUG: key_file = #{key_file}") if opts_debug
    
    #     credentials = Google::Auth::ServiceAccountCredentials.make_creds(
    #         json_key_io: File.open(key_file),
    #         scope: 'https://www.googleapis.com/auth/cloud-platform' # Replace with the appropriate scope if needed
    #     )
    #     puts("Credentials Obj: #{credentials}") if opts_debug
    #     token = credentials.fetch_access_token!

    #     puts("token.access_token starts with: #{ token.fetch('access_token')[0,5] }") if opts_debug
        
    #     payload_hash = {
    #         "instances": [
    #             { "content": truncated_content },
    #         ],
    #         "parameters": {
    #             "temperature": 0.2,
    #             "maxOutputTokens": 1000,
    #             "topP": 0.9,
    #             "topK": 40
    #         }
    #     }
    
    #     # Create an HTTP object
    #     http = Net::HTTP.new(url.host, url.port)
    #     http.use_ssl = (url.scheme == 'https') # Enable SSL if the URL uses 'https'
    
    #     headers = {
    #       'Content-Type': 'application/json' ,
    #       "Authorization": "Bearer #{token.fetch('access_token')}",
    #     }
    #     #puts(headers) if opts_debug
    #     #credentials.apply(headers)
    
    #     #puts("Request payload: #{payload_hash.to_json}")
    #     # Prepare the request
    #     response = Net::HTTP.post(url, payload_hash.to_json, headers)
    
    #     # Apply the access token to the request's authorization header
    #     #credentials.apply!(request)
    #     #puts("Request after applying creds: #{request}")
    #     # Send the request and receive the response
    #     #response = http.request(request)
    
    #     # Check the response and handle the result
    #     if response.code == '200'
    #       puts "Request succeeded!"
    #       puts "Response body:"
    #       puts response.body
    
    #       json_body = JSON.parse(response.body)
    #       the_answer = json_body['predictions'][0]['content']
    #       return the_answer
    #     else
    #       puts 'HTTP ERROR'
    #       puts "Request failed with code: #{response.code}"
    #       puts "Error message: #{response.message}"
    #       return nil
    #     end
    #     #return response.body.fetch
    #   end
    
    





end

