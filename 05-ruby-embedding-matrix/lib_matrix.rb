

# https://stackoverflow.com/questions/10370040/printing-a-readable-matrix-in-ruby

class Matrix
  # optimized for integers
  def print_readable
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
  def print_pct_readable
    i = 0
#    print '[ '
    self.each do |number|
      print "[ " if i==0
      printed_num = sprintf('%03.1f', number*100).to_s
      printed_num = "💯  " if printed_num == "100.0" # '100.00' is the only number possible which is 1 digit too long ;)
      print printed_num + " "
      i+= 1
      if i == self.column_size
        print "]\n"
        i = 0
      end
    end
    print "\n"
    return true
  end

  # I know its symmetrical and it has 100% in diagonal so it 
  def max_index 
    compute_max_index_and_value() unless @max_index
    @max_index # eg, [3,5]  
  end

  def max_value 
    compute_max_index_and_value() unless @max_value
    @max_value
  end
  def min_value 
    compute_max_index_and_value() unless @min_value
    @min_value
  end
  def min_index 
    compute_max_index_and_value() unless @min_index
    @min_index # eg, [3,5]  
  end

  # Compute max index and max value at the same time, and memoize both. This is Fast!
  def compute_max_index_and_value
    return if (@max_index and @max_value)
    #puts 'Memoizing once and for all @max_index and @max_value.. (if you read me twice, you can Kill Riccardo (or Bill))'

    @max_value = -1
    @min_value = 123 # more than 1
    self.each_with_index do |number, i,j|
      #puts "M[#{i},#{j}] = #{number}"        
      if i != j and number > @max_value
        #puts "[#{i},#{j}] habemus new value for max: #{number}"
        @max_value = number
        @max_index = [i,j]
      end
      if i != j and number < @min_value
        #puts "[#{i},#{j}] habemus new value for min: #{number}"
        @min_value = number
        @min_index = [i,j]
      end
    end
    true
  end

end
