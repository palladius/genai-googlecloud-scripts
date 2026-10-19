Testing Gemini2.0 with ruby and the new https://rubyllm.com/ RubyGem.

* github: https://github.com/crmne/ruby_llm (by an Italian in Berlin!)
* Official Page: https://rubyllm.com/

## Ruby-only

Code is here:

* `chat.rb` has a simple chat.
* `imagen.rb` produces a single image.
* `image-understand.rb` reads image created, describes it and dumps to file.

## Rails 8 tutorial

```bash
$ gem install rails
$ rails new blog # oops 7.1.4
$ cd rails
$ rails generate scaffold post title:string body:text active:boolean genai_summary:string
```
