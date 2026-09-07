#!/usr/bin/env bash
# add-mandatory-frontmatter.sh
# Adds minimal YAML frontmatter (title) to ALL .md/.mdx files that lack it.
# Now also processes zero-byte (empty) files instead of skipping them.

set -euo pipefail

if [[ $# -eq 0 || "$1" == "-h" || "$1" == "--help" ]]; then
    echo "Usage:"
    echo "  $(basename "$0") <directory> [--dry-run|-n]"
    echo ""
    echo "Examples:"
    echo "  $(basename "$0") .                      # Process current directory"
    echo "  $(basename "$0") content/docs           # Process specific subfolder"
    echo "  $(basename "$0") ./src/pages --dry-run  # Preview changes only"
    echo ""
    echo "The script will:"
    echo "  - Only touch .md and .mdx files"
    echo "  - Add frontmatter to files without it (including empty files)"
    echo "  - Skip files that already start with '---'"
    echo "  - Derive title from filename (capitalized, spaces instead of -/_)"
    exit 0
fi

TARGET_DIR="$1"
DRY_RUN=false

if [[ "${2:-}" == "--dry-run" || "${2:-}" == "-n" ]]; then
    DRY_RUN=true
    # consume the flag
    shift
fi

# Basic validation
if [[ ! -d "$TARGET_DIR" ]]; then
    echo "Error: '$TARGET_DIR' is not a directory" >&2
    exit 1
fi

echo "Processing directory: $TARGET_DIR"
echo "Dry run: $DRY_RUN"
echo "----------------------------------------"
echo

find "$TARGET_DIR" -type f \( -name "*.md" -o -name "*.mdx" \) -print0 | while IFS= read -r -d '' file; do
    first_line=$(head -n 1 "$file" 2>/dev/null || echo "")

    if [[ "$first_line" == "---" ]]; then
        echo "Already has frontmatter: $file"
        continue
    fi

    # File is either empty or lacks frontmatter → we add it
    filename=$(basename "$file")
    title=$(echo "$filename" | sed 's/\.[^.]*$//; s/[-_]/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2));}1')

    if [[ ! -s "$file" ]]; then
        echo "Processing empty file: $file"
    fi

    new_content=$(cat <<EOF
---
title: $title
---

$(cat "$file")
EOF
)

    if $DRY_RUN; then
        echo "Would add frontmatter to: $file"
        echo "Derived title: $title"
        if [[ ! -s "$file" ]]; then
            echo "(file was empty)"
        fi
        echo "----------------------------------------"
        echo "$new_content" | head -n 12
        echo "..."
        echo
    else
        echo "$new_content" > "$file.tmp" && mv "$file.tmp" "$file"
        echo "Added frontmatter → $file  (title: $title)"
    fi
done

echo "Done."