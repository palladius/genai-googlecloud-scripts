
# Splits pages into single pages
# https://stackoverflow.com/questions/35946470/ruby-using-pdftk-to-split-a-multi-page-pdf-into-many-single-page-pdfs
# Alternative, split from CLI:
# $ gem install hexapdf
# $ hexapdf modify -i 1-10 input.pdf output.pdf

require 'combine_pdf'

my_pdf = 'bank-statements/Shares.pdf'

pages = CombinePDF.load(my_pdf).pages;
i = 0
pages.each_with_index do |page, ix|
   pdf = CombinePDF.new
   pdf << page
   pdf.save("out/#{i}.pdf")
   i+=1
end
puts("Saved #{i} pages from #{my_pdf} into out/")
