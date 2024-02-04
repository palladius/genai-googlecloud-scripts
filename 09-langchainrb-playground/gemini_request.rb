
# puts 'remimuovimi'
require 'json'

class GeminiRequest

  attr_accessor :project_id, :region, :model

  # def validate_region(region)
  #   # TODO: https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini?hl=it#gemini-pro
  #   true
  # end

  def initialize(region: , project_id:, model: nil)
    @region = region
    @project_id = project_id
    @model = model || 'gemini-pro'
  end

  def request_hash_template(text: nil)
    text ||= "Give me a recipe for banana bread."
    return { contents: {
        role: "user",
        parts: {
            "text": text
        },
      },
      safety_settings: {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_LOW_AND_ABOVE"
      },
      generation_config: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40
      }
    }
  end

  def request(text_body: nil, image: nil)
    #require 'active_support/hash_with_indifferent_access'
    #ret = JSON.parse(request_json_template)
    req = Google::Apis::AiplatformV1::GoogleCloudAiplatformV1PredictRequest.new request_hash_template
    ret[:text_body] = text_body
    ret
  end


  def request_uri
    #POST
    "https://#{region}-aiplatform.googleapis.com/v1/projects/#{project_id}/locations/#{region}/publishers/google/models/#{model}:streamGenerateContent"
  end

  def uri
    request_uri
  end

  def to_s
    "#{self.class.emoji} POST #{request_uri}"
  end



  ################
  # Class methods
  ################
  def self.emoji
    "♊️"
  end

end
