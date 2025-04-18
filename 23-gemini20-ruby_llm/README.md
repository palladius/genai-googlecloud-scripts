Testing Gemini2.0 with ruby and the new https://rubyllm.com/ RubyGem.

## Ruby-only

Code is here:

* `chat.rb` has a simple chat.
* `imagen.rb` produces a single image.

## Rails 8 tutorial

$ rails new blog # oops 7.1.4
# gem install rails
$ cd rails
$ rails generate scaffold post title:string body:text active:boolean genai_summary:string
