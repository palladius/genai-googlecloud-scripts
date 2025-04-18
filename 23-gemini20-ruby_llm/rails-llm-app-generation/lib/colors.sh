# lib/colors.sh

# Simple colors and styles for bash scripts
# Because life's too short for monochrome terminals! 😉

# Reset all attributes
RESET='\033[0m'

# Regular Colors
BLACK='\033[0;30m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'

# Bold
B_BLACK='\033[1;30m'
B_RED='\033[1;31m'
B_GREEN='\033[1;32m'
B_YELLOW='\033[1;33m'
B_BLUE='\033[1;34m'
B_MAGENTA='\033[1;35m'
B_CYAN='\033[1;36m'
B_WHITE='\033[1;37m'

# Underline
U_BLACK='\033[4;30m'
U_RED='\033[4;31m'
U_GREEN='\033[4;32m'
U_YELLOW='\033[4;33m'
U_BLUE='\033[4;34m'
U_MAGENTA='\033[4;35m'
U_CYAN='\033[4;36m'
U_WHITE='\033[4;37m'

# Background
BG_BLACK='\033[40m'
BG_RED='\033[41m'
BG_GREEN='\033[42m'
BG_YELLOW='\033[43m'
BG_BLUE='\033[44m'
BG_MAGENTA='\033[45m'
BG_CYAN='\033[46m'
BG_WHITE='\033[47m'

# --- Helper Functions ---

# Usage: cecho COLOR "Your message"
cecho() {
  local color_var_name="${1}"
  local message="${2}"
  # Dynamically get the color code based on variable name
  local color_code="${!color_var_name}"
  if [[ -z "$color_code" ]]; then
    echo "Error: Color '$color_var_name' not found." >&2
    echo "$message" # Print message without color
  else
    echo -e "${color_code}${message}${RESET}"
  fi
}

# Example usage (can be commented out)
# cecho B_GREEN "This is bold green!"
# cecho U_RED "This is underlined red!"
# cecho YELLOW "Just yellow."
# echo -e "This has ${B_BLUE}bold blue${RESET} and ${U_CYAN}underlined cyan${RESET} text."
