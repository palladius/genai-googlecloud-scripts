#  scopiazzed from: https://zilliz.com/blog/build-end-to-end-genai-app-with-ruby-and-milvus

require 'langchain'

# milvus = Langchain::Vectorsearch::Milvus.new(
#   url: ENV["MILVUS_URL"],
#   index_name: "Documents",
#   llm: Langchain::LLM::OpenAI.new(api_key: ENV["OPENAI_API_KEY"])
# )
#
my_pdf = 'bank-statements/Shares.pdf'

pdf = Langchain.root.join(my_pdf)

puts("+ Langchain parsed my pdf: #{pdf}")
# milvus.add_data(path: pdf)

# response = milvus.ask(question: "What’s the company’s vacation policy? How much can I take off?")
# puts response
weather = Langchain::Tool::Weather.new(api_key: ENV['OPEN_WEATHER_API_KEY'])
google_search = Langchain::Tool::GoogleSearch.new(api_key: ENV['SERPAPI_API_KEY'])
calculator = Langchain::Tool::Calculator.new

# openai = Langchain::LLM::OpenAI.new(api_key: ENV["OPENAI_API_KEY"])
gemini = Langchain::LLM::GoogleGemini.new(api_key: ENV['PALM_API_KEY_GEMINI'])

agent = Langchain::Agent::ReActAgent.new(
  llm: gemini,
  tools: [weather, google_search, calculator]
)
