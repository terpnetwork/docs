#!/usr/bin/env bash
# Thin wrapper — implementation is check-scaffolds.py
exec python3 "$(dirname "$0")/check-scaffolds.py" "$@"
