#!/bin/bash

# Script to generate a new sample Rails 8+ application
# Uses Tailwind, SQLite3, skips Git, and adds custom gems.
# Includes a --fast mode for quicker, minimal generation.
# Designed to be rerunnable! 🎉

# --- Configuration ---
APP_NAME="sample-llm-app-sqlite3"
GEMS_TO_ADD=("ruby_llm" "rainbow") # Add your desired gems here!
MIN_RAILS_MAJOR_VERSION=8

# --- Script Flags ---
fast_mode=false
if [[ "$1" == "--fast" ]]; then
  fast_mode=true
  shift # Remove --fast from arguments if processing more later
fi

# --- Load Colors ---
# (Color loading code remains the same as before)
if [[ -f "lib/colors.sh" ]]; then
  # shellcheck source=lib/colors.sh
  source "lib/colors.sh"
else
  echo "Warning: lib/colors.sh not found. Proceeding without colors."
  # Define dummy cecho if colors are missing
  cecho() { echo "${2}"; }
  B_BLACK='' B_RED='' B_GREEN='' B_YELLOW='' B_BLUE='' B_MAGENTA='' B_CYAN='' B_WHITE='' RESET=''
  B_B_BLACK='' B_B_RED='' B_B_GREEN='' B_B_YELLOW='' B_B_BLUE='' B_B_MAGENTA='' B_B_CYAN='' B_B_WHITE=''
  U_BLACK='' U_RED='' U_GREEN='' U_YELLOW='' U_BLUE='' U_MAGENTA='' U_CYAN='' U_WHITE=''
fi

# --- Helper Functions ---
check_command() {
  # (check_command function remains the same)
  if ! command -v "$1" &> /dev/null; then
    cecho B_RED "🛑 Error: Command '$1' not found."
    cecho YELLOW "Please install $1 and ensure it's in your PATH."
    exit 1
  fi
}

check_rails_version() {
  local rails_version_output
  local rails_version
  local major_version

  cecho B_CYAN "🔍 Checking Rails version..."
  if ! rails_version_output=$(rails --version 2>&1); then
      cecho B_RED "🛑 Error running 'rails --version'. Is Rails installed correctly?"
      exit 1
  fi

  # Extract version number (handles formats like "Rails 8.0.2")
  rails_version=$(echo "$rails_version_output" | awk '{print $2}')
  major_version=$(echo "$rails_version" | cut -d '.' -f 1)

  if [[ -z "$major_version" ]] || ! [[ "$major_version" =~ ^[0-9]+$ ]]; then
      cecho B_RED "🛑 Could not parse Rails version from output: '$rails_version_output'"
      exit 1
  fi

  if (( major_version < MIN_RAILS_MAJOR_VERSION )); then
    cecho B_RED "🛑 Error: Rails version $rails_version found."
    cecho YELLOW "   This script requires Rails version $MIN_RAILS_MAJOR_VERSION.0.0 or higher."
    cecho YELLOW "   Please upgrade Rails: gem update rails"
    exit 1
  else
    cecho GREEN "✅ Rails version $rails_version is compatible (>= $MIN_RAILS_MAJOR_VERSION.0.0)."
  fi
}

cleanup() {
  # (cleanup function remains the same)
  if [[ -d "$APP_NAME" ]]; then
    cecho B_YELLOW "🧹 Found existing directory '$APP_NAME'. Cleaning it up..."
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
if [[ "$fast_mode" == true ]]; then
  cecho B_YELLOW "⚡ FAST MODE ENABLED ⚡ - Skipping non-essential components."
fi

# 1. Check Prerequisites & Rails Version
check_command "ruby"
check_command "bundle"
check_command "rails"
check_rails_version # New version check function

# 2. Cleanup old directory if it exists
cleanup

# 3. Build Rails New Options
cecho B_CYAN "🛠️ Preparing Rails options..."
RAILS_NEW_OPTS="-d sqlite3 --css tailwind --skip-git"

if [[ "$fast_mode" == true ]]; then
  cecho YELLOW "   Adding FAST mode options..."
  RAILS_NEW_OPTS+=" --skip-test"
  RAILS_NEW_OPTS+=" --skip-action-mailer"
  RAILS_NEW_OPTS+=" --skip-action-mailbox"
  RAILS_NEW_OPTS+=" --skip-action-text"
  RAILS_NEW_OPTS+=" --skip-active-storage"
  RAILS_NEW_OPTS+=" --skip-action-cable"
  RAILS_NEW_OPTS+=" --skip-hotwire"
  RAILS_NEW_OPTS+=" --skip-jbuilder"
  RAILS_NEW_OPTS+=" --skip-bootsnap"
  RAILS_NEW_OPTS+=" --skip-spring"
  RAILS_NEW_OPTS+=" --skip-listen"
  # Note: Skipping asset pipeline/sprockets/propshaft/javascript is generally
  # NOT recommended with --css tailwind, as Tailwind relies on them.
fi
cecho GREEN "✅ Rails options prepared."

# 4. Generate the Rails App
cecho B_CYAN "🛠️ Generating new Rails app '$APP_NAME'..."
cecho YELLOW "   Options: $RAILS_NEW_OPTS"

# Construct the command
RAILS_NEW_CMD="rails new $APP_NAME $RAILS_NEW_OPTS"
cecho YELLOW "   Running: $RAILS_NEW_CMD"

if $RAILS_NEW_CMD; then
  cecho GREEN "✅ Rails app generated successfully."
else
  cecho B_RED "🛑 Error generating Rails app. Check the output above."
  exit 1
fi

# 5. Navigate into the app directory
cd "$APP_NAME" || { cecho B_RED "🛑 Failed to change directory to '$APP_NAME'."; exit 1; }
cecho B_CYAN "📂 Changed directory to $(pwd)"

# 6. Add Custom Gems & Bundle Install
bundle_env=""
if [[ "$fast_mode" == true ]]; then
  cecho B_CYAN "💨 Skipping gem documentation install (--fast mode)..."
  bundle_env="BUNDLE_GEM__NO_DOCUMENT=true"
fi

run_bundle_command() {
    local bundle_command="bundle $@"
    cecho YELLOW "   Running: $bundle_env $bundle_command"
    if env $bundle_env $bundle_command; then
        return 0
    else
        return 1
    fi
}

if [[ ${#GEMS_TO_ADD[@]} -gt 0 ]]; then
  cecho B_CYAN "💎 Adding specified gems: ${GEMS_TO_ADD[*]}..."
  if run_bundle_command add "${GEMS_TO_ADD[@]}"; then
    cecho GREEN "✅ Gems added and bundle installed successfully."
  else
    cecho B_RED "🛑 Error adding gems or running bundle install. Check Gemfile and logs."
    exit 1
  fi
else
    cecho YELLOW "🤷 No extra gems specified to add."
    # Ensure bundle install runs even if no gems are added, just in case
    # Needs to happen after rails new completes its own bundle install if any.
    # Usually `rails new` runs bundle install itself, but an explicit run
    # might be needed if `--skip-bundle` was used (which we don't).
    # Let's just ensure it's consistent.
    cecho B_CYAN "🏃 Ensuring bundle is up-to-date..."
    if run_bundle_command install; then
        cecho GREEN "✅ Bundle install check successful."
    else
        cecho B_RED "🛑 Error running bundle install check."
        exit 1
    fi
fi

# 7. Final Instructions
cecho B_MAGENTA "🎉 All done! Your '$APP_NAME' app is ready."
if [[ "$fast_mode" == true ]]; then
    cecho B_YELLOW "   NOTE: App generated in --fast mode. Many features (tests, mailer, etc.) were skipped."
fi
cecho GREEN "   Navigate into the directory: cd $APP_NAME"
cecho GREEN "   Start the server: bin/rails server"
cecho YELLOW "   Remember to edit the Gemfile to configure/remove the placeholder gems ('foo', 'bar') if needed!"
cecho B_BLUE "   Happy coding! 😄"

exit 0
