require 'pdf-reader' # https://github.com/yob/pdf-reader
require 'ascii85_native' # from https://github.com/yob/pdf-reader

my_pdf = 'bank-statements/Shares.pdf'

reader = PDF::Reader.new(my_pdf)

puts('1. Metadata')
puts reader.pdf_version
puts reader.info
puts reader.metadata
puts reader.page_count

puts('# 2. Content')
reader.pages.each_with_index do |page, ix|
  puts("##  Page #{ix} ")
  # puts page.fonts
  # puts page.text
  puts page.raw_content
end
