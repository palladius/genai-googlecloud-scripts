#!/usr/bin/env ruby

# This file is genai-embeddings-generate.rb
#
# Before running, make sure you've done the following:
#     gem install google-apis-aiplatform_v1
#     gcloud auth application-default login
#
# Also, update the four constants below as needed.
#
# Then execute the file:
#     PROJECT_ID=your-real-project ./genai-embeddings-generate.rb
#
# It will create a directory called "out" and write the embeddings text files there.
# They contain an array of N normalized variables, so it only makes visible sense
# when you create a scalar product among the two to see the similitude between 2 sentences.

PROJECT = ENV.fetch('PROJECT_ID', `gcloud config get core/project`.chomp)
OUTPUT_DIR = "out"
MODEL_ID = "textembedding-gecko" # @001
MESSAGES = [

    # "Nel mezzo del cammin di nostra vita
    # mi ritrovai per una selva oscura,
    # ché la diritta via era smarrita.", # Divine comedy verse 1

    # "Ahi quanto a dir qual era è cosa dura,
    # esta selva selvaggia e aspra e forte,
    # che nel pensier rinova la paura!", # Divine comedy verse 2

    # "Respiri piano per non far rumore
    # Ti addormenti di sera e ti risvegli col sole
    # Sei chiara come un'alba
    # Sei fresca come l'aria", # Vasco Rossi - Alba Chiara - verse 1

    # "Diventi rossa se qualcuno ti guarda
    # E sei fantastica quando sei assorta
    # Nei tuoi problemi, nei tuoi pensieri", # Vasco Rossi - Alba Chiara - verse 2


    # "Cantami, o Diva, del Pelìde Achille
    # l'ira funesta che infiniti addusse
    # lutti agli Achei, molte anzi tempo all'Orco
    # generose travolse alme d'eroi", # Ilyad, italian proemio, MONTI Vincenzo (1754-1828)

    #testing the double \" quote
    #'"Thou, Nature, art my goddess"', # 7. Edmund in King Lear 1.2, “Thou, Nature, art my goddess”

    # https://en.wikipedia.org/wiki/To_be,_or_not_to_be - divided in 2:
    # verse 1
    "To be, or not to be, that is the question", # Shakespeare, Amlet
    "Essere, o non essere, questo è il dilemma", # same in Italian 82.1% good :)
    "Być albo nie być - oto jest pytanie",       # same in polish  62.1% bad (and 70.6 with Italian) :/
    "Sein oder nicht Sein, das ist hier die Frage", # same in German
    #"Essere, o non essere, questo è il problema", # same in Italian with little change on "Question" semantic
    #"存在还是不存在，这是一个问题", # gtranslated in chinese
    #"Cúnzài háishì bù cúnzài, zhè shì yīgè wèntí", # ditto
    #"生存还是灭亡，这是个问题",
    #"出自維基百科，自由嘅百科全書", they're 100%
    # verse 2-5, EN
    "Whether 'tis nobler in the mind to suffer
    The slings and arrows of outrageous fortune,
    Or to take Arms against a Sea of troubles,
    And by opposing end them: to die, to sleep",

    # verse 2-5, italian # https://www.studenti.it/essere-o-non-essere-il-monologo-di-amleto.html
    # "È egli più decoroso per l'anima di tollerare i colpi
    # dell'ingiusta fortuna, o impugnare le armi contro un mare
    # di dolori e, affrontandoli, finirli? Morire, dormire, null'altro",

    #"L'occhio spento lo sguardo di cemento, lei è il mio piccione, io il suo monumento", # Servi della Gleba
    #"Ricordati di comprare: Latte, biscotti mulino bianco e fusilli de cecco", # non poetic sentence

    #"Io adoro gli spaghetti al ragu, sono un piatto intimamente italiano.",
    #  #"M'illumino d'immenso", Ungaretti
    #"Spaghetti bolognese",
    #"Pizza con ananas",

    ########################################
    # Warsaw
    ########################################
    #
    # To be or not to be
    # http://www.doradca.com.pl/po_godzinach/lyteratura/kot-w-pustym.htm
    # Kot w pustym mieszkaniu (by Wisława Szymborska)
    # DEath as peerceived by a cat, says my buddy Magdalena G.

    "Umrzeć - tego się nie robi kotu.
    Bo co ma począć kot
    w pustym mieszkaniu.
    Wdrapywać się na ściany.
    Ocierać między meblami.",

    "Nic niby tu nie zmienione,
    a jednak pozamieniane.
    Niby nie przesunięte,
    a jednak porozsuwane.
    I wieczorami lampa już nie świeci.",

    # https://en.wikiquote.org/wiki/Pan_Tadeusz, for the Warsaw presentation on 7nov23
    # beginning of book 1, super famous, but talks re Lithuania (potentially divisive?)
    # # Basically the most famous poetry ever in POland.
        "Litwo! Ojczyzno moja! Ty jesteś jak zdrowie.
        Ile cię trzeba cenić, ten tylko się dowie,",

        "Kto cię stracił. Dziś piękność twą w całej ozdobie
        Widzę i opisuję, bo tęsknię po tobie.",

        # https://en.wikiquote.org/wiki/Pan_Tadeusz
    # Book 3 of flirtations
    "Tak to na świecie wszystko los zwykł kończyć dzwonem.
    Rachunki myśli wielkiej, plany wyobraźni,
    Zabawki niewinności, uciechy przyjaźni,",
    # "Wylania się serc czułych! - gdy śpiż z dala ryknie,
    # Wszystko miesza się, zrywa, mąci się i niknie!",

    "Thus in this world fate all with a bell's tolling ends,
    Great ambitions, great projects of imagination,
    Childhood's playtimes and friendship's heart-felt consolations,",
    # "The hearts' tender confessions! Should some dread bronze roar
    # From afar, all is shattered, confused - is no more!",
    #
    'king',
    'queen',
    # 'man',
    # 'woman',
    'male',
    'female',
]

# This is my TODO list for my next experiment. Having a list of couples to distill extract the "perfect" versor (
# [1,0,0,0], [0,1,0,0], and so on) for a vectorial space made of things which are meaningful to a human, like
# Space, time, gender, color, and so on.
# TODO(ricc): move this to another script, and compute all the deltas, and print the difference between the 2 vector, maybe
# normalized (v1-v2) - > |v1-v2| and see if it makes sense at all? Maybe calculate the cosinus or (rho, theta) of the resulting
# vector?
VersorExperiment = [
  time: [
    "Yesterday I was happy",
    "Tomorrow I will be happy",
  ],
  number: [
    "1 animal",
    "1000 animals",
  ],
  adult_vs_young_animal: [
    "an animal",
    "a pet",
  ],
  adult_vs_young_human: [
    "a person",
    "a child",
  ],
  gender1: [
    "a king",
    "a queen",
  ],
  gender2: [ # this seems worse, since man could be interpreted more widely as both man and woman.
    "a man",
    "a woman",
  ],
  gender2b: [ # similar but more precise on gender
    "a male",
    "a female",
  ],
]

# assert size is not more than 5 - i think its the limit

require "base64"
require "fileutils"
require "google/apis/aiplatform_v1"

def yellow(s)
  "\033[1;33m#{s}\033[0m"
end
client = Google::Apis::AiplatformV1::AiplatformService.new
client.root_url = "https://us-central1-aiplatform.googleapis.com/"
client.authorization = Google::Auth.get_application_default

# Array of hashes: [
#   {content: "foo"},
#   {content: "bar"},
#   {content: "baz"},
# ]

#ArrayOfContentHashes = MESSAGES.map{|message| {content: message.tr('"', "") }}
ArrayOfContentHashes = MESSAGES.map{|message| {content: message }}

request = Google::Apis::AiplatformV1::GoogleCloudAiplatformV1PredictRequest.new \
  instances: ArrayOfContentHashes

response = client.predict_project_location_publisher_model \
  "projects/#{PROJECT}/locations/us-central1/publishers/google/models/#{MODEL_ID}",
  request


FileUtils.mkdir_p OUTPUT_DIR
response.predictions.each_with_index do |prediction, index|
  puts "== Prediction #{index} =="
  puts "* Original Messages: #{yellow MESSAGES[index]}"
  puts "* Statistics: #{prediction['embeddings']['statistics']}"
  puts "* Dimensions: #{prediction['embeddings']['values'].size}"
  filename = "#{OUTPUT_DIR}/embedding-#{index}.txt"
  final_hash = {
    "embeddings" => prediction["embeddings"],
    "original_message" => MESSAGES[index],
  }
  #File.write filename, prediction["embeddings"]
  File.write filename, final_hash # adding both the output that the meaningful input for future reference / crunching.
  puts "* Wrote #{filename}"
  puts ""
end




# Putting comments below for screenshotting the code :P


    # "Avete 'n vo' li fior' e la verdura
    # e ciò che luce od è bello a vedere;
    # risplende più che sol vostra figura", # Guido Cavalcanti https://it.wikiquote.org/wiki/Guido_Cavalcanti , closest to Vasco



    # "Senza dolersi mai della vita che l'abbandona,
    # fa solamente sentire la consunzione di tutte le forze vitali;
    # e non altra sollecitudine se non se che l'anima
    # venga pietosamente raccolta dalla sua donna.
    # Quei tanti ritornelli di parole e di idee ripetute
    # danno qui non so che grazia mista al patetico,
    # che si sente ma non si descrive.
    # Evvi anche lo artificio del chiaroscuro nei versi
    # brevi che scorrono rapidi, dopo di essere stati
    # preceduti dall'armonia lenta e grave degli endecasillabi.",
    # # (Ugo Foscolo) [referring to https://it.wikiquote.org/wiki/Guido_Cavalcanti ]

        # "I like my dog",
    # "I love my dog",
    # "I adore my dog",
    # "Hello, how are you?",
    # "Hey, how's it going?",
    #"ti piace studiare", # Vasco Alba Chiara, small excerpt
    #"Non te ne devi vergognare",  # Vasco Alba Chiara, small excerpt
