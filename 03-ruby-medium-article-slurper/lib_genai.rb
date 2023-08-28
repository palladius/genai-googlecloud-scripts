# This has a few utility functions for GenAI in Ruby.
module LibGenai

    require 'net/http'
    require 'uri'
    require 'googleauth'

    def genai_text_curl(project_id, content, opts={})
        opts_debug = opts.fetch :debug, true # should be false

        model_id='text-bison'
        truncated_content = content[0, 2000]
    
        api_url =  "https://us-central1-aiplatform.googleapis.com/v1/projects/#{project_id}/locations/us-central1/publishers/google/models/#{model_id}:predict"
        ENV['GOOGLE_APPLICATION_CREDENTIALS'] ||= 'secret.json'    
        key_file = File.expand_path(ENV.fetch('GOOGLE_APPLICATION_CREDENTIALS'))
        

        url = URI.parse(api_url)
        puts("URL: #{url}") if opts_debug
    
        puts("DEBUG: key_file = #{key_file}") if opts_debug
    
        credentials = Google::Auth::ServiceAccountCredentials.make_creds(
            json_key_io: File.open(key_file),
            scope: 'https://www.googleapis.com/auth/cloud-platform' # Replace with the appropriate scope if needed
        )
        puts("Credentials Obj: #{credentials}") if opts_debug
        token = credentials.fetch_access_token!

        puts("token.access_token starts with: #{ token.fetch('access_token')[0,5] }") if opts_debug
        
        payload_hash = {
            "instances": [
                { "content": truncated_content },
            ],
            "parameters": {
                "temperature": 0.2,
                "maxOutputTokens": 1000,
                "topP": 0.9,
                "topK": 40
            }
        }
    
        # Create an HTTP object
        http = Net::HTTP.new(url.host, url.port)
        http.use_ssl = (url.scheme == 'https') # Enable SSL if the URL uses 'https'
    
        headers = {
          'Content-Type': 'application/json' ,
          "Authorization": "Bearer #{token.fetch('access_token')}",
        }
        #puts(headers) if opts_debug
        #credentials.apply(headers)
    
        #puts("Request payload: #{payload_hash.to_json}")
        # Prepare the request
        response = Net::HTTP.post(url, payload_hash.to_json, headers)
    
        # Apply the access token to the request's authorization header
        #credentials.apply!(request)
        #puts("Request after applying creds: #{request}")
        # Send the request and receive the response
        #response = http.request(request)
    
        # Check the response and handle the result
        if response.code == '200'
          puts "Request succeeded!"
          puts "Response body:"
          puts response.body
    
          json_body = JSON.parse(response.body)
          the_answer = json_body['predictions'][0]['content']
          return the_answer
        else
          puts 'HTTP ERROR'
          puts "Request failed with code: #{response.code}"
          puts "Error message: #{response.message}"
          return nil
        end
        #return response.body.fetch
      end
    
    


    def generate(content)
        genai_text_curl('ricc-genai', content)
        # genai_auth()
        # payload_hash = {
        #     "instances": [
        #         { "content": content },
        #     ],
        #     "parameters": {
        #         "temperature": 0.5,
        #         "maxOutputTokens": 1000,
        #         "topP": 0.8,
        #         "topK": 40
        #     }
        # }
        # return "[FAKE] This is me BArding around this input: #{input[0,10]}"
    end

    def genai_auth()
        require 'googleauth'

        # Get the environment configured authorization
        scopes =  ['https://www.googleapis.com/auth/cloud-platform']
        authorization = Google::Auth.get_application_default(scopes)

        # Add the the access token obtained using the authorization to a hash, e.g
        # headers.
        some_headers = {}
        authorization.apply(some_headers)

        
    end


end

