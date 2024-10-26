#!/usr/bin/env ruby
#
# Test all ruby scripts in here
#
#

default_project = 'ricc-genai'
PROJECT_ID=ENV.fetch('PROJECT_ID', default_project)

def test_code(cmd)
  puts "•☽────✧˖°˖☆˖°˖✧────☾• " * 5
  puts "🔹 Executing: #{cmd}"
  ret = system("#{cmd} 1>/dev/null 2>&1")
  puts("♦️ Cmd exited: #{ret} and $? = #{$?}")
  puts "🟥 Test for '#{cmd}' FAILED!" unless $? == 0
  puts ''
end

def main()
  #1. code
  test_code("PROJECT_ID=#{PROJECT_ID} ./genai-code-generate.rb")

  #2. Embedding generate
  test_code("PROJECT_ID=#{PROJECT_ID} ./genai-embeddings-generate.rb")

  #3. Images generation
  test_code("PROJECT_ID=#{PROJECT_ID} ./images-generate.rb")

  #4. Text/completion generation
  test_code("PROJECT_ID=#{PROJECT_ID} ./genai-text-generate.rb")


end


main()
