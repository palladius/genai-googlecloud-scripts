
BUNDLE_LOCAL__LANGCHAINRB: "/usr/local/google/home/ricc/git/langchainrb-pr513"


## checking Andrei code

Currently stryggling to work with Andrei code in localhost.
I can check in just fine, I can also edit it :) but I cant cal it via bundler.
I can call it if I skip bundler and just import the lib/ but that opens other issues, for instance i need to manually import ALL libraries manually (JSON, HHTParty, ..).

```
# REMOVING THIS now
$ bundle config set local.lanchainrb ~/git/langchainrb-pr513/
```

```
cd ~/git &&
    gh repo clone patterns-ai-core/langchainrb langchainrb-pr513 &&
    cd ~/git/langchainrb-pr513 &&
    gh pr checkout 513 &&
    git br
```

# Rubies

* ✅ tested on `3.1.2`
* ✅ tested on `3.2.1`
* ❌ Get error on `3.2.2` and `3.3.0`:
```
In Gemfile:
  langchainrb was resolved to 0.12.0, which depends on
    pragmatic_segmenter was resolved to 0.3.23, which depends on
      unicode
```

## TODO

1. Test it with openai while Gemini wont work yet.
2. Use `bundle exec`
3. Function calling with OpenAI and soon Gemini but not Ollama.
