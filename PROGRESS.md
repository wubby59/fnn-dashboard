# FNN Dashboard - Build Progress

## Phase 1: Backend Foundation - COMPLETE
- [x] package.json with express + better-sqlite3
- [x] server/db.js - SQLite schema with WAL mode
- [x] server/index.js - Express entry point
- [x] server/routes/agent.js - POST /api/agent/report, /archive, /vpn
- [x] server/routes/api.js - GET /api/dashboard, /archive, /vpn, /counts
- [x] server/routes/admin.js - PUT/DELETE device management
- [x] server/seed.js - 12 devices, 24h stats, 30d archive/VPN data

## Phase 2: Frontend Shell + Design System - COMPLETE
- [x] public/index.html - SPA shell with all sections
- [x] public/css/design-system.css - Full color palette, glassmorphism, typography
- [x] public/css/layout.css - Header, footer, animated background, responsive
- [x] public/js/api.js - Fetch wrapper
- [x] public/js/theme.js - Dark/light/auto toggle
- [x] public/js/app.js - Init + 15s polling loop
- [x] Design assets copied to public/assets/

## Phase 3: Service Orbs + Lightning - COMPLETE
- [x] public/css/orbs.css - Orb styling, drift animations, status indicators
- [x] public/js/orbs.js - Orb rendering from device data
- [x] public/js/lightning.js - Canvas lightning between nearby orbs

## Phase 4: System Stats Cards - COMPLETE
- [x] public/css/cards.css - Glass stat cards, progress bars, responsive grid
- [x] public/js/stats.js - Card rendering with pin/delete actions

## Phase 5: Charts - COMPLETE
- [x] public/css/charts.css - Chart container grid
- [x] public/js/charts.js - Archive growth + VPN traffic Chart.js charts

## Phase 6: Legend + Polish - COMPLETE
- [x] public/js/legend.js - Footer color-coded device legend
- [x] Animated gradient background with 10 floating decorative orbs
- [x] Responsive breakpoints (desktop/tablet/mobile)
- [x] Reduced motion support

## Phase 7: Python Agent - COMPLETE
- [x] agent/fnn_agent.py - Full monitoring agent with psutil
- [x] agent/requirements.txt

## Phase 8: Documentation + Scripts - COMPLETE
- [x] CLAUDE.md - Project rules
- [x] docs/architecture.md
- [x] docs/decisions-log.md
- [x] scripts/setup.sh - One-command install
- [x] scripts/snapshot.sh - Session state capture
- [x] PROGRESS.md

## Post-Review Fixes - COMPLETE
- [x] XSS prevention: All renderers use DOM creation instead of innerHTML
- [x] HTML escaping utility (escapeHtml) and color sanitizer (sanitizeColor) in api.js
- [x] Orb drift/hover transform conflict fixed (wrapper element for drift, orb for hover)
- [x] In-place DOM updates to preserve animations during 15s polling
- [x] API key auth middleware (FNN_API_KEY env var) for agent/admin endpoints
- [x] Input validation: device_id length, orb_color hex format, array size limits
- [x] Route registration order fixed (/api/admin before /api)
- [x] Promise.allSettled for graceful partial failure handling
- [x] Chart theme updates on dark/light toggle
- [x] VPN chart colors changed from red/green to orange/indigo (color-blind safe)
- [x] Lightning canvas DPI-aware (devicePixelRatio scaling)
- [x] Reduced-motion stops RAF loop instead of running empty frames
- [x] Error messages sanitized (no internal details leaked to clients)
- [x] Periodic cleanup (hourly) instead of on every request
- [x] Archive/VPN 30-day data retention cleanup added
- [x] Composite indexes on (file_name, reported_at) and (common_name, reported_at)
- [x] Seed script guarded with require.main check
- [x] JSON body size limit (1mb)
- [x] Tooltip colors adapt to light/dark mode
