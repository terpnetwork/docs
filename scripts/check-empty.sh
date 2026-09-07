#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# check-empty.sh — Find docs with no body content (frontmatter only)
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="${1:-$(cd "$SCRIPT_DIR/../src/pages" && pwd)}"
DRY_RUN=false

if [[ "${2:-}" == "--dry-run" || "${2:-}" == "-n" ]]; then
    DRY_RUN=true
fi

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}Scanning for empty docs in${NC} $DOCS_DIR"
echo ""

empty_count=0
total=0

while IFS= read -r -d '' file; do
    total=$((total + 1))
    rel="${file#$DOCS_DIR/}"

    # Check if file starts with frontmatter
    first_line=$(head -n 1 "$file" 2>/dev/null || echo "")
    if [[ "$first_line" != "---" ]]; then
        # No frontmatter at all — skip (check-headers.sh handles this)
        continue
    fi

    # Find the closing --- and check if there's body content after it
    # Strategy: read line by line, track when frontmatter closes
    body_found=false
    in_frontmatter=true
    line_num=0

    while IFS= read -r line || [[ -n "$line" ]]; do
        line_num=$((line_num + 1))
        if $in_frontmatter; then
            if [[ "$line_num" -gt 1 && "$line" == "---" ]]; then
                in_frontmatter=false
            fi
        else
            # Non-whitespace line after frontmatter = body content exists
            if [[ -n "$(echo "$line" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//')" ]]; then
                body_found=true
                break
            fi
        fi
    done < "$file"

    if ! $body_found; then
        if awk '
          BEGIN { fm = 0 }
          /^---[[:space:]]*$/ {
            if (fm == 0) { fm = 1; next }
            if (fm == 1) { exit }
          }
          fm == 1 { print }
        ' "$file" | grep -Eiq '^status:[[:space:]]*["'\'']?(stub|outline)["'\'']?[[:space:]]*$'; then
            echo -e "  ${YELLOW}EMPTY (labeled stub)${NC}  ${rel}"
            continue
        fi
        empty_count=$((empty_count + 1))
        echo -e "  ${YELLOW}EMPTY${NC}  ${rel}"
        if $DRY_RUN; then
            echo "         (frontmatter only — no body content)"
        fi
    fi
done < <(find "$DOCS_DIR" -type f \( -name '*.md' -o -name '*.mdx' \) -print0 2>/dev/null)

echo ""
echo -e "  ${CYAN}Total docs scanned${NC}  ${total}"
echo -e "  ${YELLOW}Empty (frontmatter only)${NC}  ${empty_count}"

if [[ $empty_count -eq 0 ]]; then
    echo ""
    echo -e "${GREEN}✓ No empty docs found${NC}"
    exit 0
else
    echo ""
    echo -e "${YELLOW}Found ${empty_count} empty doc(s) needing content${NC}"
    exit 1
fi