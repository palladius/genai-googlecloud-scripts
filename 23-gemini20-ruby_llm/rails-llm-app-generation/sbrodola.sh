#!/bin/bash

# Script to generate a new sample Rails 8+ application
# Usage: ./sbrodola.sh [app_name] [--fast] [--db=sqlite3|postgresql|pg]
# Uses Tailwind, skips Git, adds custom gems, runs post-generation steps.
# Designed to be rerunnable! 🎉

# --- Default Configuration ---
DEFAULT_APP_NAME="sample-llm-app"
# APP_NAME will be set below after checking arguments
GEMS_TO_ADD=("ruby_llm" "rainbow" "devise") # Add your desired gems here!
MIN_RAILS_MAJOR_VERSION=8

# --- Script Flags / Options ---
fast_mode=false
db_type="sqlite3" # Default DB
APP_NAME=""       # Placeholder, will be set below

# --- Argument Parsing ---

# Check for optional App Name as the first argument
if [[ $# -gt 0 ]] && [[ "$1" != -* ]]; then
  # First argument exists and doesn't start with '-', assume it's the app name
  APP_NAME="$1"
  shift # Consume the app name argument, so flags start at $1 now
else
  # No app name provided as first argument, use the default
  APP_NAME="$DEFAULT_APP_NAME"
fi

# Now process the remaining arguments (flags)
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --fast)
      fast_mode=true
      shift # past argument
      ;;
    --db=*)
      db_type="${key#*=}"
      shift # past argument=value
      ;;
    *)    # unknown option
      # Load colors early for error message if possible
      # Ensure colors are loaded only once even if script exits here
      if ! command -v cecho &> /dev/null && [[ -f "lib/colors.sh" ]]; then
          source "lib/colors.sh"
      fi
      # Define dummy cecho if colors still not available
      if ! command -v cecho &> /dev/null; then
          cecho() { echo "${2}"; }
          B_RED='' RESET=''
      fi

      cecho B_RED "Error: Unknown option: $key"
      echo "Usage: $0 [app_name] [--fast] [--db=sqlite3|postgresql|pg]"
      echo "  Example: $0 my_cool_app --db=pg --fast"
      exit 1
      ;;
  esac
done

# --- Load Colors (Ensure loaded properly now) ---
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

# --- Validate DB Type ---
# (DB Type validation remains the same)
if [[ "$db_type" != "sqlite3" && "$db_type" != "postgresql" && "$db_type" != "pg" ]]; then
    cecho B_RED "🛑 Invalid database type: '$db_type'."
    cecho YELLOW "   Supported types: 'sqlite3' (default), 'postgresql' (or 'pg')."
    exit 1
fi
# Normalize "pg" to "postgresql" for rails new command
if [[ "$db_type" == "pg" ]]; then
    db_type="postgresql"
fi

# --- Announce effective settings ---
cecho B_CYAN "Effective settings:"
cecho B_CYAN "  App Name: $APP_NAME"
cecho B_CYAN "  Database: $db_type"
cecho B_CYAN "  Fast Mode: $fast_mode"


# --- Helper Functions ---
check_command() {
  # (check_command function remains the same)
  if ! command -v "$1" &> /dev/null; then
    cecho B_RED "🛑 Error: Command '$1' not found."
    cecho YELLOW "Please install $1 and ensure it's in your PATH."
    exit 1
  fi
}

check_db_prereqs() {
    if [[ "$db_type" == "postgresql" ]]; then
        cecho B_CYAN "🔍 Checking PostgreSQL prerequisites..."
        if ! command -v psql &> /dev/null; then
            cecho B_YELLOW "   ⚠️ Warning: 'psql' command not found."
            cecho YELLOW "   Rails generation might succeed (adding the 'pg' gem),"
            cecho YELLOW "   but you'll need PostgreSQL server installed and running,"
            cecho YELLOW "   and potentially client libraries ('libpq-dev' or similar) installed"
            cecho YELLOW "   for the 'pg' gem to compile and connect."
            # Optionally, make this a hard exit:
            # cecho B_RED "   Please install PostgreSQL client tools and ensure server is running."
            # exit 1
        else
            cecho GREEN "   ✅ 'psql' command found."
        fi
    fi
}

check_rails_version() {
  # (check_rails_version function remains the same)
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
check_rails_version
check_db_prereqs # Check DB specific stuff

# 2. Cleanup old directory if it exists
cleanup

# 3. Build Rails New Options
cecho B_CYAN "🛠️ Preparing Rails options..."
# Use the selected DB type
#RAILS_NEW_OPTS="-d $db_type --css tailwind --skip-git"
# Riccardo: i DO need git for the gitignore, then i can just rm -rf  .git :)
RAILS_NEW_OPTS="-d $db_type --css tailwind "

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
    cecho B_CYAN "🏃 Ensuring bundle is up-to-date..."
    if run_bundle_command install; then
        cecho GREEN "✅ Bundle install check successful."
    else
        cecho B_RED "🛑 Error running bundle install check."
        exit 1
    fi
fi
# In sbrodola.sh, near the end:

# 7. Run Post-Generation Script
post_generate_script="../lib/post_generate.sh" # Path relative to inside APP_NAME dir
if [[ -f "$post_generate_script" ]]; then
    cecho B_CYAN "🚀 Running post-generation script: $post_generate_script"
    # Make sure it's executable (useful if pulled from git)
    chmod +x "$post_generate_script"
    # Pass the database type as an argument
    if bash "$post_generate_script" "$db_type"; then # <--- MODIFIED HERE
        cecho GREEN "✅ Post-generation script executed successfully."
    else
        cecho B_RED "🛑 Error executing post-generation script. Check output above."
        # Decide if this is a fatal error
        # exit 1
    fi
else
    cecho B_YELLOW "🤷 Post-generation script ($post_generate_script) not found. Skipping."
fi

# 8. Final Instructions
cecho B_MAGENTA "🎉 All done! Your '$APP_NAME' app is ready."
if [[ "$fast_mode" == true ]]; then
    cecho B_YELLOW "   NOTE: App generated in --fast mode. Many features were skipped."
fi
if [[ "$db_type" == "postgresql" ]]; then
    cecho B_YELLOW "   Reminder for PostgreSQL:"
    cecho B_YELLOW "   - Ensure PostgreSQL server is running."
    cecho B_YELLOW "   - Configure 'config/database.yml' with your DB user/password/host if needed."
    cecho B_YELLOW "   - Run 'bin/rails db:create' to create the database."
fi
cecho GREEN "   Navigate back to the app directory if you left it: cd $APP_NAME"
cecho GREEN "   Run pending migrations (if any from post-generate): bin/rails db:migrate"
cecho GREEN "   Start the server: bin/rails server"
#cecho YELLOW "   Remember to edit the Gemfile to configure/remove the placeholder gems ('foo', 'bar') if needed!"
cecho B_BLUE "   Happy coding! 😄"

# Navigate back to the original directory (optional, good practice)
# cd ..

exit 0
