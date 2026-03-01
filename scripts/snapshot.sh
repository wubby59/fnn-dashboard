#!/usr/bin/env bash
# FNN Dashboard - Session state capture
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

cd "$PROJECT_DIR"

echo "=== FNN Dashboard Snapshot ==="
echo "Timestamp: $TIMESTAMP"
echo ""

echo "--- File Structure ---"
find . -type f \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  -not -path './server/data/*' \
  -not -path './design-assets.tar.gz' \
  -not -path './dash.tar.gz' \
  -not -name '*.tar' \
  -not -name '*.tar.gz' \
  | sort

echo ""
echo "--- Database Stats ---"
if [ -f "server/data/fnn.db" ]; then
    sqlite3 server/data/fnn.db "SELECT 'devices: ' || COUNT(*) FROM devices;
SELECT 'services: ' || COUNT(*) FROM system_services;
SELECT 'stats: ' || COUNT(*) FROM system_stats;
SELECT 'archive: ' || COUNT(*) FROM archive_files;
SELECT 'vpn: ' || COUNT(*) FROM vpn_connections;" 2>/dev/null || echo "(sqlite3 not available)"
else
    echo "(no database yet)"
fi

echo ""
echo "--- Package Info ---"
node -e "const p = require('./package.json'); console.log(p.name + ' v' + p.version);" 2>/dev/null || echo "(no package.json)"

echo ""
echo "--- Server Test ---"
if curl -s --max-time 2 http://localhost:3000/api/counts > /dev/null 2>&1; then
    echo "Server: RUNNING"
    curl -s http://localhost:3000/api/counts 2>/dev/null
else
    echo "Server: NOT RUNNING"
fi
