#!/bin/bash

# lib/post_generate.sh

# Post-generation script for the sample-llm-app
# Executed from within the newly created app directory.

# --- Get DB Type from Argument ---
DB_TYPE="$1"
if [[ -z "$DB_TYPE" ]]; then
    echo "Error: Database type argument not received by post_generate.sh" >&2
    exit 1
fi


function _db_reset() {
  if [[ "$DB_TYPE" == "postgresql" ]]; then
    cecho B_MAGENTA "--- Database Reset (PostgreSQL) ---"
    cecho B_YELLOW "   Attempting to DROP existing development database (if any)..."
    cecho YELLOW "      Running: bin/rails db:drop RAILS_ENV=development (Errors ignored if DB doesn't exist)"

    # Run db:drop, redirect output to /dev/null, and ignore exit status with '|| true'
    if bin/rails db:drop RAILS_ENV=development &> /dev/null || true; then
        cecho GREEN "      ✅ Database dropped (or did not exist)."
    else
         # This part is unlikely to be reached due to '|| true', but handles unexpected failures
         cecho YELLOW "      ⚠️  db:drop command finished (failure ignored, likely DB didn't exist)."
    fi

    cecho B_YELLOW "   Attempting to CREATE development database..."
    cecho YELLOW "      Running: bin/rails db:create RAILS_ENV=development"
    if bin/rails db:create RAILS_ENV=development; then
        cecho GREEN "      ✅ Database created successfully."
    else
        cecho B_RED "      ❌ Failed to create database. Stopping."
        cecho B_RED "         Check PostgreSQL connection in 'config/database.yml' and ensure the server is running."
        cecho B_RED "         Make sure the specified user has CREATE DATABASE permissions."
        exit 1 # Stop script if we can't create the DB
    fi
    cecho B_MAGENTA "--- End Database Reset ---"
else
    cecho YELLOW "   Skipping database reset step (DB type is '$DB_TYPE')."
fi
}

# Post-generation script for the sample-llm-app
# Executed from within the newly created app directory.

# --- Load Colors (Relative path from app dir to lib dir) ---
# Go up one level to find the lib directory relative to the script's execution context
if [[ -f "../lib/colors.sh" ]]; then
  # shellcheck source=../lib/colors.sh
  source "../lib/colors.sh"
else
  echo "Warning: ../lib/colors.sh not found. Proceeding without colors."
  # Define dummy cecho if colors are missing
  cecho() { echo "${2}"; }
  B_BLUE='' B_GREEN='' B_YELLOW='' B_RED='' RESET=''
fi

cecho B_BLUE "⚙️ Running post-generation steps from RubyLLM docs..."

set -euo pipefail

_db_reset

# --- Setup Devise ---
cecho B_YELLOW "   Setting up Devise..."
if bin/rails generate devise:install; then
    cecho GREEN "   ✅ Devise initialized."
else
    cecho B_RED "   ❌ Failed to initialize Devise."
    # exit 1
fi

cecho B_YELLOW "   Generating Devise User model..."
if bin/rails generate devise User; then # This creates the User model and migration
    cecho GREEN "   ✅ Devise User model generated."
else
    cecho B_RED "   ❌ Failed to generate Devise User model."
    # exit 1
fi

# --- End Devise Setup ---


#cecho B_YELLOW '1. Add Devise inspired by https://medium.com/@xnjiang/using-devise-in-rails8-f558202a6535'
# bundle add devise --version "~> 4.9.4"
# bundle
# rails generate devise:install
# rails generate devise User
# if bin/rails g model User name:string email:string:index; then
#   cecho GREEN "      ✅ Generated User model & migration."
# else
#   cecho B_RED "      ❌ Failed to generate User model & migration."
#   # exit 1 # Optional: stop if this fails
# fi

# rails db:migrate

# Generate basic models and migrations
rails g model Chat model_id:string user:references # Example user association
rails g model Message chat:references role:string content:text model_id:string input_tokens:integer output_tokens:integer tool_call:references
rails g model ToolCall message:references tool_call_id:string:index name:string arguments:jsonb

# # --- Add your custom commands here! ---

# # Example: Generate some migrations
# cecho B_YELLOW "   Generating example migrations (placeholders)..."

# # Remember to replace these with your actual migration commands!
# if bin/rails g migration CreateThing name:string description:text; then
#   cecho GREEN "   ✅ Generated CreateThing migration."
# else
#   cecho B_RED "   ❌ Failed to generate CreateThing migration."
#   # Decide if failure here should stop everything (exit 1) or just warn
# fi

# if bin/rails g migration AddUserRefToThing user:references; then
#   cecho GREEN "   ✅ Generated AddUserRefToThing migration."
# else
#   cecho B_RED "   ❌ Failed to generate AddUserRefToThing migration."
# fi

# if bin/rails g migration CreateAnotherModel value:integer category:string{10}:index; then
#     cecho GREEN "   ✅ Generated CreateAnotherModel migration."
# else
#     cecho B_RED "   ❌ Failed to generate CreateAnotherModel migration."
# fi

cecho GREEN "   ✅ Carmine RubyLLM migration generations were successful... now lets migrate."


# Example: Run migrations (Optional - you might want to do this manually)
cecho B_YELLOW "   Running database migrations..."
if rails db:migrate; then
  cecho GREEN "   ✅ Database migrations successful."
else
  cecho B_RED "   ❌ Failed to run database migrations."
  # exit 1 # Optional: Exit if migrations fail
fi


# Add any other setup commands you need:
# - bin/rails db:seed
# - bin/rails generate some_scaffold MyModel field1:string
# - etc.

cecho B_BLUE "✅ Post-generation steps finished."

exit 0 # Indicate success
