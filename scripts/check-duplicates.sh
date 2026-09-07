#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# check-duplicates.sh — Find duplicate filenames (ignoring extension)
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="${1:-$(cd "$SCRIPT_DIR/../src/pages" && pwd)}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "Scanning: $DOCS_DIR"
echo ""

declare -A file_map
duplicate_count=0

while IFS= read -r -d '' file; do
    [[ "$(basename "$file")" == .* ]] && continue
    [[ "$file" == *"/_"* ]] && continue
    
    base=$(basename "$file")
    name="${base%.*}"
    rel="${file#$DOCS_DIR/}"
    
    if [[ -n "${file_map[$name]:-}" ]]; then
        file_map[$name]="${file_map[$name]}|$rel"
    else
        file_map[$name]="$rel"
    fi
done < <(find "$DOCS_DIR" -type f \( -name '*.md' -o -name '*.mdx' \) -print0 2>/dev/null)

for name in "${!file_map[@]}"; do
    IFS='|' read -ra paths <<< "${file_map[$name]}"
    if [[ ${#paths[@]} -gt 1 ]]; then
        duplicate_count=$((duplicate_count + 1))
        echo -e "${YELLOW}DUPLICATE${NC} ${MAGENTA}${name}${NC}"
        for p in "${paths[@]}"; do
            ext="${p##*.}"
            echo -e "  ${CYAN}•${NC} .${ext}  ${p}"
        done
        echo ""
    fi
done

if [[ $duplicate_count -eq 0 ]]; then
    echo -e "${GREEN}✓ No duplicate filenames found${NC}"
    exit 0
else
    echo -e "${YELLOW}Found ${duplicate_count} duplicate basename(s)${NC}"
    exit 1
fi