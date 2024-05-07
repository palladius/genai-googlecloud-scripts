#!/bin/bash

bundle list | grep langchainrb

rm Gemfile.lock
gem list | grep langchainrb
bundle exec gem uninstall langchainrb
bundle update langchainrb
bundle install langchainrb

# buyndle clean --force # cleans everything
