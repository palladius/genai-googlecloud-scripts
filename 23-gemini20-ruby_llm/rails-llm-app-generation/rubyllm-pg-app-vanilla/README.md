# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version: 3.3.4
* Rails: 8.0.1

## INSTALL

```bash
cp .env.dist .env
```

## Tests:

Elaborated from this: https://rubyllm.com/guides/rails

```
chat_record = Chat.create!(user: User.first, title: 'test.')
response = chat_record.ask "What is the capital of France?"
```

