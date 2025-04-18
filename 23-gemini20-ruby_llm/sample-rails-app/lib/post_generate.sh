#!/bin/bash

# lib/post_generate.sh

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
