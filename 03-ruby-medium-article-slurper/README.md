# Synopsis

The idea is to find a Medium user and see what this person blogs about.

For instance, take this XML containing the author's Medium posts: https://medium.com/feed/@palladiusbonton

The beauty of this example is that you can ask GenAI to also ask other questions. In this case, we are asking the LLM to (see/change code in `test.rb`):

* Please write about the topics, the style, and rate the article from 1 to 10 in terms of accuracy or professionalism.
* Please also tell me, for each article, whether it talks about Google Cloud.
* Can you guess the nationality of the person writing the articles?

# Installation

This script is written in Ruby. 

* Install ruby: https://www.ruby-lang.org/en/documentation/installation/ (I suggest using a wrapper like `rbenv` or `rvm` to keep your root environment clean) 
* `bundle install` to install dependencies
* Download a Service Account key onto this folder. either name it `secret.json` or set GOOGLE_APPLICATION_CREDENTIALS to proper path.
* run the script and enjoy:

```
# For instance 
MEDIUM_USER_ID=allenchun ruby test.rb
```