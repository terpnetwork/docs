#!/usr/bin/env bash
# Find broken internal links in Vocs pages (src/pages).
# Usage: ./scripts/check-links.sh [docs-dir]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCS_DIR="${1:-$ROOT/src/pages}"

exec python3 "$SCRIPT_DIR/check-links.py" "$DOCS_DIR"
