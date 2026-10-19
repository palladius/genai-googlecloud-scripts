# Synopsis

Note: This code is explained in thie Medium article: https://medium.com/@palladiusbonton/parse-medium-articles-with-genai-and-add-some-fun-02fe9d30475a

The idea is to find a **Medium** user (eg, https://medium.com/feed/@palladiusbonton) and see what this person blogs about, and other interesting insights.

The beauty of this example is that you can ask GenAI to also ask other questions. In this case, we are asking the LLM to (see/change code in `main.rb`):

* Please write about the topics, the style, and rate the article from 1 to 10 in terms of accuracy or professionalism.
* Please also tell me, for each article, whether it talks about Google Cloud.
* Can you guess the nationality of the person writing the articles?
* If you can find any typos or visible mistakes, please write them down. (*This worked well, as it found a typo in my article!*)

# Installation

This script is written in Ruby. 

## Local install

* 1. Install ruby: https://www.ruby-lang.org/en/documentation/installation/ (I suggest using a wrapper like `rbenv` or `rvm` to keep your root environment clean) 
* 2. `bundle install` to install dependencies. Then choose one authentication method: 
* 3. [A option]. Download a Service Account key onto this folder. Either name it `secret.json` or set GOOGLE_APPLICATION_CREDENTIALS to proper path
* 3. [B option]. Alternatively, you can `gcloud auth application-default login` (web login and store token locally).
* 3. [C option]. Use Cloud Shell - in this case you don't need to bother.
* 4. Run the script and enjoy:

```
# For instance:
MEDIUM_USER_ID=palladiusbonton ruby main.rb
```

## Install/Run from Cloud Shell

Cloud Shell comes with ruby already pre-installed (version `2.7.8` at the time of writing) so you can try this script without any effort!

* Open Cloud Shell. Learn more about Cloud Shell here: https://cloud.google.com/shell/docs/using-cloud-shell
* In the terminal, type: `git clone https://github.com/palladius/genai-googlecloud-scripts.git`
* Then type: `cd genai-googlecloud-scripts/03-ruby-medium-article-slurper/`
* `MEDIUM_USER_ID=palladiusbonton ruby main.rb`. 
* Note you don't need to authenticate as Cloud Shell will ask you to authenticate from web (with a click from your identity): super convenient (and safe)!

# Results

A possible and insightful result is this:

<pre>
[..]

* Article 2:

The article discusses the difference between Italian and American spaghetti bolognese. The author, who is Italian, argues that the American version of spaghetti bolognese is not authentic Italian cuisine. He explains that in Italy, spaghetti is typically served with a simple tomato sauce, while bolognese sauce is typically served with tagliatelle or other types of pasta. The author also discusses the history of spaghetti bolognese and provides a recipe for authentic Italian bolognese sauce. 

The article is well-written and informative. The author does a good job of explaining the differences between Italian and American spaghetti bolognese and providing a recipe for authentic Italian bolognese sauce. The article is also humorous, as the author pokes fun at the American version of spaghetti bolognese. 

The article does not mention Google Cloud. 

The author is likely Italian, as he mentions that he is from Italy and that he prefers the Italian version of spaghetti bolognese. 

There are no typos or visible mistakes in the article. 

* Article 3:

The article discusses how to move projects from one Google Cloud organization to another. The author provides step-by-step instructions on how to do this, as well as tips on how to avoid common mistakes. The article is well-written and informative. The author does a good job of explaining the process of moving projects between organizations and providing helpful tips. 

The article mentions Google Cloud several times. 

The author is likely Italian, as he mentions that he is from Italy and that he uses the Italian language. 

There are a few typos and visible mistakes in the article. For example, the author misspells the word "organization" as "organzation" in one place. 

Overall, the article is a good resource for anyone who needs to move projects between Google Cloud organizations.
</pre>
