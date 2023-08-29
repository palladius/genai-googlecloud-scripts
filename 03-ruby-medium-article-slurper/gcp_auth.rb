module GcpAuth

require 'googleauth'


    # Gets GCP token via gcloud (easy) or via service account (provided via GOOGLE_APPLICATION_CREDENTIALS)
    def gcp_project_id_and_access_token()
        # lets get the token in 2 ways:


        #1 We do have ENV['GOOGLE_APPLICATION_CREDENTIALS']
        if ENV.fetch('GOOGLE_APPLICATION_CREDENTIALS', nil)
            puts '1. We have an explicit key'
            key_file = ENV.fetch 'GOOGLE_APPLICATION_CREDENTIALS'
            credentials = Google::Auth::ServiceAccountCredentials.make_creds(
                    json_key_io: File.open(key_file),
                    scope: 'https://www.googleapis.com/auth/cloud-platform' # Replace with the appropriate scope if needed
                )
            token = credentials.fetch_access_token!
            access_token = token.fetch('access_token')
            return [credentials.project_id, access_token]
        end

        # 2. We dont have that but we do have gcloud
        `which gcloud` ; if $? == 0
            puts '2. habemus gcloud'
            return [
                `gcloud config get project`.chomp, 
                # doesnt work `gcloud auth application-default print-access-token`.chomp]
                `gcloud auth print-access-token`.chomp]
        end

        # 3. Let's identify a possibly existing auto-magic file
        if File.exist?('secret.json')
            puts '3. no gcloud, no GOOGLE_APPLICATION_CREDENTIALS, but File exists!'
            ENV['GOOGLE_APPLICATION_CREDENTIALS'] = 'secret.json'
            # I know, this is risky if implementation changes.
            return gcp_project_id_and_access_token()
        end

        # 4. try the application default version as well :) Not sure how to extract its project_id though
        # doesnt work `gcloud auth application-default print-access-token`.chomp]

        [:unknown_project, :unknown_bearer_token]
    end

end