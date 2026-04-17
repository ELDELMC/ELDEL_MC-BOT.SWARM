#!/bin/bash
# Fix script for sharp module issues

echo "🔧 Fixing sharp module installation..."

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall dependencies with optional packages
npm install --include=optional

echo "✅ Sharp module fixed. Try running 'npm start' again."