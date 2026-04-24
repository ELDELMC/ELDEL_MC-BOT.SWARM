#!/usr/bin/env bash
# Script with recommended commands to remove accidental `.env` commits from git history.
# This must be run locally where you have git and appropriate permissions.

set -euo pipefail

echo "IMPORTANT: Review commands before running. Back up your repo first."

echo "1) Remove .env from current commit and add to .gitignore"
git rm --cached .env || true
git add .gitignore
git commit -m "chore: remove .env and add to .gitignore" || true

echo "2) To purge `.env` from ALL history, use one of these tools:" 
echo "  - Recommended: git filter-repo (faster, safer)."
echo "    pip install git-filter-repo"
echo "    git filter-repo --path .env --invert-paths"

echo "  - Or BFG (simpler):"
echo "    Download BFG and run:" 
echo "    java -jar bfg.jar --delete-files .env"
echo "    git reflog expire --expire=now --all && git gc --prune=now --aggressive"

echo "3) After rewriting history, force-push to remote (coordinate with collaborators):"
echo "    git push --force --all"
echo "    git push --force --tags"

echo "4) Rotate any exposed credentials (MongoDB, API keys, etc.) immediately."
