#!/usr/bin/env bash
# Mock script that simulates SteamVault dry-run output for VHS recording
# No real auth, Steam directories, or Node.js required

set -e

cmd="steamvault --dry-run"

CYAN='\033[0;36m'
GREEN='\033[0;32m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Simulated Inquirer.js select menu
# $1 = prompt message, $2 = selected option, $3.. = other options
print_menu() {
    local prompt="$1"
    shift
    local selected="$1"
    shift

    echo -e "${GREEN}?${NC} ${BOLD}${prompt}${NC}"
    echo -e "${CYAN}> ${selected}${NC}"
    for opt in "$@"; do
        echo -e "  ${DIM}${opt}${NC}"
    done
}

# Simulated Inquirer.js after selection
# $1 = prompt message, $2 = answer
print_answer() {
    echo -e "${GREEN}?${NC} ${BOLD}${1}${NC} ${CYAN}${2}${NC}"
}

clear

# Simulate typed command
echo -ne "$ "
for (( i=0; i<${#cmd}; i++ )); do
    echo -n "${cmd:$i:1}"
    sleep 0.04
done
echo ""
sleep 0.5

# Dry-run info
echo -e "${CYAN}Running in Dry-Run mode. No new screenshots will be uploaded${NC}"
echo ""

# Main menu
print_menu "Choose an option" "Run Backup" "Settings" "Exit"
sleep 2

clear

# Main menu answered
print_answer "Choose an option" "Run Backup"
echo ""

# Backup menu
print_menu "Choose between full or partial(wip) backup" "Full Dry-Run" "Full (disabled)" "Return"
sleep 2

clear

# Backup menu answered
print_answer "Choose between full or partial(wip) backup" "Full Dry-Run"
echo ""

# Dry-run output
sleep 0.5

screenshots=(
    "20250822190433_1.jpg|Counter-Strike 2"
    "20250822191201_1.jpg|Counter-Strike 2"
    "20250103142055_1.jpg|Half-Life 2"
    "20250215163012_1.jpg|Elden Ring"
    "20250215163744_1.jpg|Elden Ring"
    "20250215170301_1.jpg|Elden Ring"
    "20250401120000_1.jpg|Cyberpunk 2077"
    "20250401121530_1.jpg|Cyberpunk 2077"
    "20250612200145_1.jpg|Portal 2"
)

for entry in "${screenshots[@]}"; do
    IFS='|' read -r filename game <<< "$entry"
    echo "[DRY-RUN] Uploading Screenshot: ${filename} from game ${game}"
    sleep 0.15
done

echo ""
echo -e "${CYAN}[DRY-RUN] Would upload ${#screenshots[@]} screenshots to photos/SteamVault/Game-Title${NC}"

sleep 1

# Press Enter prompt
echo ""
echo -e "${GREEN}?${NC} ${BOLD}Press Enter to return to the main menu${NC}"
sleep 2

clear

# Back to main menu, navigate to Exit
print_menu "Choose an option" "Exit" "Run Backup" "Settings"
sleep 1.5

clear

echo -e "${GREEN}?${NC} ${BOLD}Choose an option${NC} ${CYAN}Exit${NC}"
echo ""
echo "Exiting program"
sleep 1
