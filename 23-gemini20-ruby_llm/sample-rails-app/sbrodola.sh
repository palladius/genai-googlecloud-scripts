#!/bin/bash

# Script to generate a new sample Rails (Edge/8+) application
# Uses Tailwind, SQLite3, skips Git, and adds custom gems.
# Designed to be rerunnable! 🎉

# --- Configuration ---
APP_NAME="sample-llm-app"
GEMS_TO_ADD=("ruby_llm" "rainbow") # Add your desired gems here!
RAILS_BRANCH="--main" # Use --main for edge Rails (targeting v8+)
# RAILS_BRANCH="--rc" # Or use --rc for release candidates if available
# RAILS_BRANCH="" # Or empty string for latest *stable* release

# --- Load Colors ---
if [[ -f "lib/colors.sh" ]]; then
  # shellcheck source=lib/colors.sh
  source "lib/colors.sh"
else
  echo "Warning: lib/colors.sh not found. Proceeding without colors."
  # Define dummy cecho if colors are missing
  cecho() { echo "${2}"; }
  B_GREEN="" B_YELLOW="" B_RED="" B_CYAN="" RESET="" B_MAGENTA=""
fi

# --- Helper Functions ---
check_command() {
  if ! command -v "$1" &> /dev/null; then
    cecho B_RED "🛑 Error: Command '$1' not found."
    cecho YELLOW "Please install $1 and ensure it's in your PATH."
    exit 1
  fi
}

cleanup() {
  if [[ -d "$APP_NAME" ]]; then
    cecho B_YELLOW "�� Found existing directory '$APP_NAME'. Cleaning it up..."
    read -p "   Are you sure you want to permanently delete '$APP_NAME'? (y/N) " -n 1 -r REPLY
    echo # Move to a new line
    if [[ "$REPLY" =~ ^[Yy]$ ]]; then
      rm -rf "$APP_NAME"
      cecho GREEN "   Directory '$APP_NAME' removed."
    else
      cecho B_RED "   Aborted cleanup. Exiting."
      exit 1
    fi
  fi
}

# --- Main Execution ---
cecho B_MAGENTA "🚀 Starting Rails App Generation: $APP_NAME"

# 1. Check Prerequisites
cecho B_CYAN "🔍 Checking prerequisites..."
check_command "ruby"
check_command "bundle"
check_command "rails"
cecho GREEN "✅ Prerequisites met."

# 2. Cleanup old directory if it exists
cleanup

# 3. Generate the Rails App
cecho B_CYAN "🛠️ Generating new Rails app '$APP_NAME' (using edge Rails: ${RAILS_BRANCH:-latest stable})..."
cecho YELLOW "   Options: SQLite3, Tailwind CSS, Skip Git"

# Construct the command
RAILS_NEW_CMD="rails new $APP_NAME -d sqlite3 --css tailwind --skip-git $RAILS_BRANCH"
cecho YELLOW "   Running: $RAILS_NEW_CMD"

if $RAILS_NEW_CMD; then
  cecho GREEN "✅ Rails app generated successfully."
else
  cecho B_RED "🛑 Error generating Rails app. Check the output above."
  exit 1
fi

# 4. Navigate into the app directory
cd "$APP_NAME" || { cecho B_RED "🛑 Failed to change directory to '$APP_NAME'."; exit 1; }
cecho B_CYAN "📂 Changed directory to $(pwd)"

# 5. Add Custom Gems
if [[ ${#GEMS_TO_ADD[@]} -gt 0 ]]; then
  cecho B_CYAN "💎 Adding specified gems: ${GEMS_TO_ADD[*]}..."
  if bundle add "${GEMS_TO_ADD[@]}"; then
    cecho GREEN "✅ Gems added and bundle installed successfully."
  else
    cecho B_RED "🛑 Error adding gems or running bundle install. Check Gemfile and logs."
    # Optionally, try appending to Gemfile as a fallback, though bundle add is preferred
    # cecho YELLOW "   Attempting fallback: Appending to Gemfile..."
    # for gem_name in "${GEMS_TO_ADD[@]}"; do
    #   echo "gem '$gem_name'" >> Gemfile
    # done
    # if bundle install; then
    #   cecho GREEN "✅ Fallback successful: Gems added and bundle installed."
    # else
    #   cecho B_RED "🛑 Fallback failed. Manual intervention needed."
    #   exit 1
    # fi
    exit 1
  fi
else
    cecho YELLOW "🤷 No extra gems specified to add."
    # Ensure bundle install runs even if no gems are added, just in case
    cecho B_CYAN "🏃 Running bundle install just in case..."
    if bundle install; then
        cecho GREEN "✅ Bundle install successful."
    else
        cecho B_RED "🛑 Error running bundle install."
        exit 1
    fi
fi


# 6. Final Instructions
cecho B_MAGENTA "🎉 All done! Your '$APP_NAME' app is ready."
cecho GREEN "   Navigate into the directory: cd $APP_NAME"
cecho GREEN "   Start the server: bin/rails server"
cecho YELLOW "   Remember to edit the Gemfile to configure/remove the placeholder gems ('foo', 'bar') if needed!"
cecho B_BLUE "   Happy coding! 😄"

exit 0

