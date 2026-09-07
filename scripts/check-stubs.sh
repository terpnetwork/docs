#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# check-stubs.sh — Find heading-only / outline docs (silent stubs)
#
# Detects MD/MDX under src/pages (Vocs) where the body is almost only
# headings, frontmatter, imports, and empty sections — i.e. pages that
# look real in the nav but have no prose or code.
#
# Exit 1 if any stub is found WITHOUT status: stub (or status: outline)
# in frontmatter — so intentional outlines are allowed when labeled.
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="${1:-$(cd "$SCRIPT_DIR/../src/pages" && pwd)}"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}Scanning for heading-only stubs in${NC} $DOCS_DIR"
echo ""

stub_unlabeled=0
stub_labeled=0
total=0

is_stub_body() {
  local file="$1"
  local body content_lines

  # Body after first closed frontmatter block
  body=$(awk '
    BEGIN { fm = 0 }
    /^---[[:space:]]*$/ {
      if (fm == 0) { fm = 1; next }
      if (fm == 1) { fm = 2; next }
    }
    fm >= 2 { print }
  ' "$file")

  # Lines that look like real content (not headings, imports, exports, fence markers alone)
  # JSX/components and blockquotes count — component-only catalog pages are not stubs.
  content_lines=$(printf '%s\n' "$body" | grep -E -v \
    -e '^[[:space:]]*$' \
    -e '^#{1,6}[[:space:]]' \
    -e '^import[[:space:]]' \
    -e '^export[[:space:]]' \
    -e '^```[[:space:]]*$' \
    -e '^```[a-zA-Z0-9_-]+[[:space:]]*$' \
    -e '^---[[:space:]]*$' \
    | wc -l | tr -d ' ')

  # Heuristic: fewer than 5 non-heading content lines ⇒ stub/outline
  [[ "${content_lines:-0}" -lt 5 ]]
}

has_stub_status() {
  local file="$1"
  # Only inspect frontmatter
  awk '
    BEGIN { fm = 0 }
    /^---[[:space:]]*$/ {
      if (fm == 0) { fm = 1; next }
      if (fm == 1) { exit }
    }
    fm == 1 { print }
  ' "$file" | grep -Eiq '^status:[[:space:]]*["'\'']?(stub|outline)["'\'']?[[:space:]]*$'
}

while IFS= read -r -d '' file; do
  total=$((total + 1))
  rel="${file#"$DOCS_DIR"/}"

  if is_stub_body "$file"; then
    if has_stub_status "$file"; then
      stub_labeled=$((stub_labeled + 1))
      echo -e "  ${YELLOW}STUB (labeled)${NC}  ${rel}"
    else
      stub_unlabeled=$((stub_unlabeled + 1))
      echo -e "  ${RED}STUB (unlabeled)${NC}  ${rel}"
    fi
  fi
done < <(find "$DOCS_DIR" -type f \( -name '*.md' -o -name '*.mdx' \) -print0 2>/dev/null)

echo ""
echo -e "  ${CYAN}Total docs scanned${NC}     ${total}"
echo -e "  ${YELLOW}Stubs with status${NC}      ${stub_labeled}"
echo -e "  ${RED}Stubs missing status${NC}   ${stub_unlabeled}"

if [[ "$stub_unlabeled" -eq 0 ]]; then
  echo ""
  echo -e "${GREEN}✓ All heading-only pages are labeled status: stub (or none found)${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}Found ${stub_unlabeled} heading-only page(s) without status: stub${NC}"
  echo "  Add frontmatter: status: stub"
  echo "  Or add real content (prose/code), not only headings."
  exit 1
fi
