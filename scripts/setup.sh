#!/usr/bin/env bash
# FNN Dashboard - One-command setup
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== FNN Dashboard Setup ==="
cd "$PROJECT_DIR"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required. Install from https://nodejs.org/"
    exit 1
fi

echo "Node.js $(node --version)"

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Create data directory
mkdir -p server/data

# Seed demo data
echo "Seeding demo data..."
npm run seed

# Copy design assets if not already done
if [ ! -d "public/assets/favicons" ]; then
    echo "Copying design assets..."
    mkdir -p public/assets
    cp -r design-assets/favicons public/assets/ 2>/dev/null || true
    cp -r design-assets/png public/assets/ 2>/dev/null || true
    cp -r design-assets/svg-icons public/assets/ 2>/dev/null || true
fi

echo ""
echo "=== Setup Complete ==="
echo "Start the dashboard:  npm start"
echo "Then open:            http://localhost:3000"
