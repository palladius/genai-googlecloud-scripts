#!/usr/bin/env ruby

require 'gemini-ai'
require 'matrix'
# This works like a charm just using the basics: https://github.com/gbaptista/gemini-ai

# With a Service Account Credentials File

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
  puts("♊️ Raw result: #{result}")
  File.write('.tmp.hi.llm_predict.json', result.to_json)

  #puts(result)
  cleaned_llm_response = result[0]['candidates'][0]['content']['parts'][0]['text'] rescue result
  # cleaned_llm_response = result.map{ |r|
  #   puts("🍰 Piece of content: #{r}")
  #   r['candidates'].map { |c|
  #     #c['content']['parts'][0]['text'] }
  #     #[0]['content']['parts'][0]['text']  }")
  #     c['content']['parts'][0]['text']
  #   }.join(' -1♊️- ') # rescue result}
  # }.join(' -2♊️- ') # rescue result
  puts("Gemini LLM responded: #{cleaned_llm_response}")
end



def pure_gemini_embeddings_predict(my_text: 'Ford Prefect')
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
      model: 'text-embedding-preview-0409',
      service_version: 'v1',
    }
  )

  result = client.request(
    'predict',
    {"instances": [
      { "content": my_text}
    ]}
  )
    # Embedding Response
  cleaned_response = result['predictions'][0]['embeddings']['values']
  puts("Gemini Embeddings responded with a #{cleaned_response.size rescue -1 }-sized embedding: #{cleaned_response.first(5) rescue result}, ...")
  return cleaned_response
end



def main
  pure_gemini_llm_predict my_text: 'Can you write a little salutation to me like you were impersonating Marvin the Paranoid Android from the HitchHikers guide to the galaxy from Douglas Adams? I would expect this to be pessimistic, vaguely rude and very humorous!'
#  pure_gemini_llm_predict my_text: 'Whats the max circumference of planet Earth in kilometers?'
  #pure_gemini_embeddings_predict # my_text: "What is life?"
  exit( 42)
  e1 = pure_gemini_embeddings_predict my_text: "What is life?"
  e2 = pure_gemini_embeddings_predict my_text: "Baby dont hurt me."
  a = Vector(e1)
  b= Vector(e2)
  scalar_product = a.inner_product(b)
  puts("❌ scalar_product: #{scalar_product}")
end

main()
