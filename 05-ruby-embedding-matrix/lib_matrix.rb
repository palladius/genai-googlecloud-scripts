

# https://stackoverflow.com/questions/10370040/printing-a-readable-matrix-in-ruby

class Matrix
  # optimized for integers
  def to_readable
      i = 0
      self.each do |number|
        print number.to_s + " "
        i+= 1
        if i == self.column_size
          print "\n"
          i = 0
        end
      end
    end

  # optimized for 0..1 floats and multiplying by 100 :)
  def pct_readable
    i = 0
    print '[ '
    self.each do |number|
      print sprintf('%03.2f', number*100).to_s + " "
      i+= 1
      if i == self.column_size
        print "]\n[ "
        i = 0
      end
    end
    print "]\n"
  end

  # I know its symmetrical and it has 100% in diagonal so it 
  def max_index 
    compute_max_index_and_value() unless @max_index # ||= begin
    #compute_max_index_and_value()
    # [3,5]  
    @max_index
  end

  # it works!
  def max_value
    @max_value ||= begin
      puts ':TODO2 max_value inside memozie'
      puts "column_size: ", self.column_size
      ret = -1
      self.each_with_index do |number, i,j|
        #puts "M[#{i},#{j}] = #{number}"        
        if i != j and number > ret 
          puts 'habemus new value for max!'
          ret = number
        else
          #
        end
      end
      ret
    end
  end

  def compute_max_index_and_value
    return if (@max_index and @max_value)
    puts 'Memoizing once and for all @max_index and @max_value.. (if you read me twice, you can Kill Riccardo (or Bill))'

    @max_value = -1
    self.each_with_index do |number, i,j|
      #puts "M[#{i},#{j}] = #{number}"        
      if i != j and number > @max_value
        puts "[#{i},#{j}] habemus new value for max: #{number}"
        @max_value = number
        @max_index = [i,j]
      end
    end
    true
  end

end