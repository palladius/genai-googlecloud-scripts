## About

This is me trying to use this doc: https://rubyllm.com/guides/rails
to store LLM messages and tool calling on DB.

This folder contains scripts, generated with Gemini 2.5 exp, which generate a sample app with pg/sqlite3 in fast or normal mode.
I've done it to do multiple iterations until the vanilla script would work. I'm then checking in a vanilla version and iterating on it.

* vanilla version for PG: `rubyllm-pg-app-vanilla/`.

## Notes
Lets see.

1. Since JSONB is not supported by sqlite3, seems like PostgreS is our only option.

Note from [here](https://sqlite.org/jsonb.html#what_is_jsonb_): **Beginning with version 3.45.0 (pending), SQLite supports an alternative binary encoding of JSON which we call "JSONB"**.


## Tests:

DB Setup:
```bash
rake db:create db:migrate db:seed # generates one user :)
rails console
...
```

See console:
```ruby
chat_record = Chat.create!(model_id: RubyLLM.config.default_model, user: User.first)
# works!
response = chat_record.ask "What is the capital of France?"

```
