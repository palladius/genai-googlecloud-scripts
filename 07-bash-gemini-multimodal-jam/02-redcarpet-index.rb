#!/usr/bin/env ruby

# I'm bad at foreseeing if an image render will work on Markdown.
# Luckily Github uses redcarpet gem for rendering Markdown.
# SO I can generate it cheap with 2 lines of code.

#  gem install redcarpet
#  Generated index.html for local testing :)
require 'redcarpet'

html = Markdown.new(File.read('README.md')).to_html
File.open('index.html', "w") { |f| f.write html }
puts("Generated index.html for local testing :)"))
