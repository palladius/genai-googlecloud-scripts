
require 'matrix'
require 'json'

require_relative 'lib_embeddings'
require_relative 'lib_matrix'

# 5 Embeddings
AoA = [[]]
EmbeddingsMaxSize = 900 # TODO move back to 800ish

def deb(s)
    puts("[DEB] #{s}") if false  # $DEBUG
end

# Creates a matrix of cross-correlation of all embeddings..
def createSquareMatrix(aoa)
    n = aoa.size # eg, 5 sentences
    #m = [[]] # Matrix.new( [0,0,0,0,0] )
    m = Matrix.build(n,n) { 0 } #  Array.new(5) { Array.new(5, 0) }
    (0..n-1).each do |i|
        #deb AoA[i].class
        (0..n-1).each do |j|
            m[i,j] = AoA[i].inner_product(AoA[j])
        end
    end
    #pp(m)
    m
end

def cleaned_up_value_for(float_number)
    sprintf("%.1f", (float_number*100).to_s)
end

def main()
    sentences = [
        'Cant buy me love',
#        'Eleanor Rigby',
        'Una nuova canzone per te',
        'Yellow submarine',
        'Your song',
        'Bella ciao',
    ]
    sentences = [
        "I ate dinner.",
        "We had a three-course meal.",
        "Brad came to dinner with us.",
        #"He loves fish tacos.",
        "In the end, we all felt like we ate too much.",
        "We all agreed; it was a magnificent evening."
    ]
    sentences = [
        "Seychelles",
        "Italy",
        "Maldives",
        "Italian Alps",
        "Swiss mountains"
    ]
    # from here: https://txt.cohere.com/sentence-word-embeddings/
    sentences = [
        "I like my dog",
        "I love my dog",
        "I adore my dog",
        "Hello, how are you?",
        "Hey, how's it going?",
    ]
    # nope, nothing relevant here. The LLM doesn't know music
    sentencesGenesis = [
        ###################################################
        # Genesis songs from Selling England by the Pound
        #####
        "Genesis - Dancing With The Moonlit Knight",
        "Genesis - Firth Of Fifth",
        #"Genesis - The Battle of Epping Forest",
        #"The cinema Show",
        "Genesis - The musical box",
        ###################################################
        # 5 Rolling Stones song
        "The Rolling Stones - Paint it black",

        ###################################################
        # Dream Theater
        "Dream Theater - Take the time",
    ]
    sentences = [
        ###################################################
        # Vegan food - https://www.healthline.com/nutrition/foods-vegans-eat#TOC_TITLE_HDR_3
        #####
        #"Broccoli",
        #"Nut butters",
        #"Chia",
        # https://www.goodhousekeeping.com/food-recipes/healthy/g807/vegan-recipes/
        'Gingery Spring Soup',
        'Sesame Noodles',
        'Tomato and Charred Pepper Farro Salad',

        ###################################################
        # Meat
        "Beef burger",

        ###################################################
        # A song, and a concept :)
        "A day at the gym", # healthy but not food
    ]
    sentences = [
        'Focaccia di Recco', # with cheese
        'agnolotti del plin',
        'canederli al formaggio',
        'Pizza prosciutto e funghi',
        'magret de canard au miel',
    ]

    sentences = sentencesGenesis

    # Writes the 5 sentences
    puts 'Original sentences (max 5):'
    sentences.each_with_index do |sentence, ix|
        puts "🔷 #{ix+1}. #{sentence}"
    end
    puts()

    ret = compute_embeddings(sentences, project_id: 'ricc-genai')
    ret_json = JSON.parse(ret)
    #puts ret_json.keys
    if (ret_json.keys.include? 'error')
        puts 'Some errors!'
        pp ret_json
        exit 1
    end
    deb ret_json['metadata']
    #puts ret_json['predictions'].class # ['embeddings']
    ret_json['predictions'].each_with_index do |prediction, ix|
        deb prediction['embeddings'].keys # values, statistics
        deb prediction['embeddings']['statistics'] # {"token_count"=>10, "truncated"=>false}
        deb prediction['embeddings']['values'].class
        AoA[ix] = Vector.send(:new,
            prediction['embeddings']['values'].pop(EmbeddingsMaxSize)
        )
    end

    #pp AoA
    correlation_matrix = createSquareMatrix(AoA)
    puts "\nCross-correlation matrix:"
    correlation_matrix.print_pct_readable

    puts "Max index/value: #{ correlation_matrix.max_index } => #{ correlation_matrix.max_value }"
    #puts "Max value again (memoized hjopefully): #{ correlation_matrix.max_index } => #{ correlation_matrix.max_value }"


    cleaned_up_value = sprintf("%.1f", (correlation_matrix.max_value*100).to_s)
    puts "\nClosest friends are: #{ correlation_matrix.max_index } with #{cleaned_up_value}% correlation"
    first_ix = correlation_matrix.max_index[0] # .first
    second_ix = correlation_matrix.max_index[1] # .second
    puts "💚 #{first_ix+1}: #{sentences[first_ix]}"
    puts "💚 #{second_ix+1}: #{sentences[second_ix]}"

    puts "\nFartherst away enemies are: #{ correlation_matrix.min_index } with #{cleaned_up_value_for correlation_matrix.min_value}% correlation"

    puts "💔 #{correlation_matrix.min_index[0]+1}: #{sentences[correlation_matrix.min_index[0]]}"
    puts "💔 #{correlation_matrix.min_index[1]+1}: #{sentences[correlation_matrix.min_index[1]]}"

    #puts "\nIntruder:"
    #puts "TODO(ricc): find the max distance from the average of all vectors"

end


main()
