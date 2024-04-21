#!/usr/bin/env ruby

=begin

  This is the Embedding ruby code which uses gbaptista rubygem.

=end

require 'gemini-ai'
require 'matrix'
# This works like a charm just using the basics: https://github.com/gbaptista/gemini-ai

# With a Service Account Credentials File

def ptitle(title)
  puts("#{title}")
end

def pure_gemini_llm_predict(my_text: 'Hi')
  puts("Gemini LLM was asked: #{my_text}")

  client = Gemini.new(
    credentials: {
      service: 'vertex-ai-api',
      file_path: 'private/ricc-genai.json' ,
      region: 'us-central1', # 'us-east4'
    },
    options: { model: 'gemini-pro', server_sent_events: true }
  )

  result = client.stream_generate_content({
    contents: { role: 'user', parts: { text: my_text } }
  })
  #puts("♊️ Raw result: #{result}")
  File.write('.tmp.hi.llm_predict.json', result.to_json)

  #puts(result)
  # result.each_with_index do |rc, ix|
  #   puts " + #{ ix} CANDIDATE: ", rc['candidates'][0]['content']['parts'][0]['text']
  # end
  #puts result.size rescue -1
  #puts result[0]['candidates'].size rescue -2
  #puts result[0]['candidates'][0]['content']['parts'].size rescue -3
  #cleaned_llm_response = result[0]['candidates'][0]['content']['parts'][0]['text'] rescue result
  #puts("result class: #{result.class}")
  cleaned_llm_response = result.map{ |r|
    #str = "🍰 Piece of content: candidate.size=#{r['candidates'].size} parts.size=#{ r['candidates'][0]['content']['parts'].size }" rescue "Some err: #{$!}"
    #puts(str)
    r['candidates'][0]['content']['parts'][0]['text'] rescue nil # "[Some error: #{$!}]"
  }.join ' ' # (" \n♊️ ") # rescue result
  puts("Gemini LLM responded: #{cleaned_llm_response}")
  return cleaned_llm_response
end



def pure_gemini_embeddings_predict(my_text: 'Ford Prefect', model: 'textembedding-gecko-multilingual' )
  puts("Gemini Embeddings was asked: #{my_text}")

  client = Gemini.new(
    credentials: {
      service: 'vertex-ai-api',
      file_path: 'private/ricc-genai.json' ,
      region: 'us-central1', # 'us-east4'
    },
# code: https://github.com/gbaptista/gemini-ai/blob/main/controllers/client.rb
#   "https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/us-central1/
#    publishers/google/models/multimodalembedding@001:predict" \

    options: {
#      model: 'multimodalembedding@001:predict',
#      model: 'multimodalembedding@001',
      model: model,
      # text-embedding-gecko -> 768 values
      #model: 'text-embedding-preview-0409',
      service_version: 'v1',
    }
  )

  request_hash = {
    "instances": [
      {
      #"task_type": "QUESTION_ANSWERING", # "Semantic Search", ## "QUESTION_ANSWERING",
      "content": my_text
    }
  ],
  # "parameters": {
  #  "outputDimensionality": 256 # 768 is the default
  # }
  }
  result = client.request('predict',request_hash )
  File.write('.tmp.hi.embed_predict.json', result.to_json)

    # Embedding Response
  cleaned_response = result['predictions'][0]['embeddings']['values']
  puts("Gemini Embeddings responded with a #{cleaned_response.size rescue -1 }-sized embedding: #{cleaned_response.first(5) rescue result}, ...")
  return cleaned_response
end



def main
  pure_gemini_llm_predict my_text: 'Can you write a little salutation to me like you were impersonating Marvin the Paranoid Android from the HitchHikers guide to the galaxy from Douglas Adams? I would expect this to be pessimistic, and very humorous!'
#  pure_gemini_llm_predict my_text: 'Whats the max circumference of planet Earth in kilometers?'
  #pure_gemini_embeddings_predict # my_text: "What is life?"
  #exit( 42)
  # e1 = pure_gemini_embeddings_predict my_text: "Veal"
  # e2 = pure_gemini_embeddings_predict my_text: "Beef"
  e1 = pure_gemini_embeddings_predict my_text: "Television", model: 'textembedding-gecko-multilingual' #
  e2 = pure_gemini_embeddings_predict my_text: "Fernsehen", model: 'textembedding-gecko-multilingual'
  e3 = pure_gemini_embeddings_predict my_text: "Television", model: 'text-embedding-preview-0409' # Preview
  e4 = pure_gemini_embeddings_predict my_text: "Fernsehen", model: 'text-embedding-preview-0409' # text-multilingual-embedding-preview-0409
  v = [
    Vector.elements(e1),
    Vector.elements(e2),
    Vector.elements(e3),
    Vector.elements(e4),
  ]
  # https://stackoverflow.com/questions/30329505/dot-product-between-2-matrices-in-ruby-most-efficient-way
  scalar_product12 = v[0].inner_product(v[1])
  scalar_product34 = v[2].inner_product(v[3])
  puts("🫀 scalar_product with textembedding-gecko-multilingual: #{scalar_product12*100}%")
  puts("🫀 scalar_product with text-embedding-preview-0409: #{scalar_product34*100}%")
end

main()
