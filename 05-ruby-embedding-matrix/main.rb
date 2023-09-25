
require 'matrix'

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
    pp(m)
    m
end

def main() 
    sentences = [
        'Cant buy me love',
        'Eleanor Rigby',
        'Una nuova canzone per te',
        'Yellow submarine',
        'Your song'
    ]

    ret = compute_embeddings(sentences, project_id: 'ricc-genai')
    require 'json'
    ret_json = JSON.parse(ret)
    puts ret_json.keys
    deb ret_json['metadata']
    puts ret_json['predictions'].class # ['embeddings']
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
    print correlation_matrix.pct_readable

    puts "Max value: #{ correlation_matrix.max_index } => #{ correlation_matrix.max_value }"
    puts "Max value again (memoized hjopefully): #{ correlation_matrix.max_index } => #{ correlation_matrix.max_value }"
    puts 'Closest friends are: #{ correlation_matrix.max_index }'
end


main()