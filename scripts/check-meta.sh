#!/usr/bin/env bash
# ensure-meta-json.sh
# Creates minimal meta.json in every subfolder under content/docs/ that lacks one,
# or replaces empty meta.json files with a default {}

# Fumadocs-only (meta.json). Vocs uses vocs.config.ts sidebar.
# Pass content/docs explicitly if you still need this on the archive tree.
TARGET_DIR="${1:-content/docs}"
DRY_RUN=false
if [[ "${2:-}" == "--dry-run" || "${2:-}" == "-n" ]]; then
    DRY_RUN=true
fi

find "$TARGET_DIR" -type d -print0 | while IFS= read -r -d '' dir; do
    meta="$dir/meta.json"

    if [[ ! -f "$meta" ]]; then
        # Derive folder name as title
        folder_name=$(basename "$dir")
        title=$(echo "$folder_name" | sed 's/[-_]/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2));}1')

        if $DRY_RUN; then
            echo "Would create: $meta"
            echo "{\"title\": \"$title\"}"
        else
            cat > "$meta" <<EOF
{
  "title": "$title"
}
EOF
            echo "Created: $meta"
        fi

    elif [[ ! -s "$meta" ]]; then
        # File exists but is empty — write default {}
        if $DRY_RUN; then
            echo "Would fix empty: $meta"
            echo "{}"
        else
            echo "{}" > "$meta"
            echo "Fixed empty: $meta"
        fi

    else
        echo "Exists: $meta"
    fi
done