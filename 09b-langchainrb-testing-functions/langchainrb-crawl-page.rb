#!/usr/bin/env bundle exec ruby

require 'dotenv/load'
require 'langchainrb'

require 'faraday'


pages_to_look = [
  'https://www.thurgauerzeitung.ch/ostschweiz/weinfelden-kreuzlingen/bierzelt-zapfenstreich-statt-ozapft-is-heuer-faellt-das-konstanzer-oktoberfest-auf-klein-venedig-ins-wasser-ld.2491611?reduced=true',
  'https://www.oktoberfest-konstanz.com/',
]
sample_wiki_terms = [
  "Thresher Shark",
  'Trasher shark', # typo on purpose
  "Donald Trump",
  "Carla Bruni",
  "Nudibranch",
  "Cow fish",
]
sample_wiki_term = sample_wiki_terms.sample

GOOGLE_SEARCH_API_KEY = ENV.fetch('GOOGLE_SEARCH_API_KEY', nil)

$prompt = 'Please read the document and summarize in English'

raise "ENV[GOOGLE_SEARCH_API_KEY] unavaiulable" if GOOGLE_SEARCH_API_KEY.nil?

# content_tmp = "Sharks are a group of elasmobranch fish characterized by a cartilaginous skeleton, five to seven gill slits on the sides of the head, and pectoral fins t
# hat are not fused to the head. Modern sharks are classified within the clade Selachimorpha (or Selachii) and are the sister group to the Batoidea (rays a
# nd kin). Some sources extend the term \"shark\" as an informal category including extinct members of Chondrichthyes (cartilaginous fish) with a shark-like
# morphology, such as hybodonts. Shark-like chondrichthyans such as Cladoselache and Doliodus first appeared in the Devonian Period (419–359 million years)
# , though some fossilized chondrichthyan-like scales are as old as the Late Ordovician (458–444 million years ago). The oldest confirmed modern sharks (se
# lachimorphs) are known from the Early Jurassic, about 200 million years ago, though records of true sharks may extend back as far as the Permian.
# Sharks range in size from the small dwarf lanternshark (Etmopterus perryi), a deep sea species that is only 17 centimetres (6.7 in) in length, to the wha
# le shark (Rhincodon typus), the largest fish in the world, which reaches approximately 12 metres (40 ft) in length. They are found in all seas and are co
# mmon to depths up to 2,000 metres (6,600 ft). They generally do not live in freshwater, although there are a few known exceptions, such as the bull shark
#  and the river shark, which can be found in both seawater and freshwater. Sharks have a covering of dermal denticles that protects their skin from damage
#  and parasites in addition to improving their fluid dynamics. They have numerous sets of replaceable teeth.
# Several species are apex predators, which are organisms that are at the top of their food chain. Select examples include the tiger shark, blue shark, gre
# at white shark, mako shark, thresher shark, and hammerhead shark.
# Sharks are caught by humans for shark meat or shark fin soup. Many shark populations are threatened by human activities. Since 1970, shark populations ha
# ve been reduced by 71%, mostly from overfishing."

def search_with_google
  puts("WATNING! Only 100 calls per month. dont use with WATCH :)")
  search = Langchain::Tool::GoogleSearch.new(api_key: GOOGLE_SEARCH_API_KEY)
  #ret = search.execute(input: "What is the capital of Alto Volta?")
  ret = search.execute(input: "What is the second city of Philippines?")
  puts(ret)
end

def search_with_wikipedia term:
  wikipedia = Langchain::Tool::Wikipedia.new
  #ret = wikipedia.execute(input: "The Roman Empire")
  #ret = wikipedia.execute(input: "Thresher Shark")
  ret = wikipedia.execute(input: term)
  #puts("🌍 Wiki content: #{ret.colorize :yellow}")
  ret
end

def ollama_summarize_with( model: :gemma, ollama_url: "http://localhost:11434", content_to_summarize: )
  llm = Langchain::LLM::Ollama.new
  llm = Langchain::LLM::Ollama.new(url: ollama_url, default_options: {
    completion_model_name: 'gemma',
    embeddings_model_name: "gemma",
    chat_completion_model_name: "gemma",
  })
  #puts(llm)
  model = llm.defaults[:chat_completion_model_name] rescue :sobenme
  puts("🦙 Summarizing with ollama (model=#{model.colorize :green})")
  ret = llm.summarize(text: content_to_summarize)
  puts("🦙 summary: #{ret.completion.colorize(:blue)}")
  ret
end

def main
  words_to_search = ARGV.join(' ')
  words_to_search = sample_wiki_term if words_to_search.length < 2
  puts("👀 Searching Wikipedia for '#{words_to_search}', then summarizing it with Llama. If you dont like the word, give me a better one via ARGV!")
  page_content = search_with_wikipedia(term: words_to_search)
  if page_content.nil?
    puts "❌ No stuff found on wikpiedia - exiting."
    exit 1
  end
  puts("🌍 Wiki content: #{page_content.colorize :yellow}")
  ollama_summarize_with(model: :gemma, content_to_summarize: page_content)
end

main()
