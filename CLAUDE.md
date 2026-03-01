# FNN Dashboard - Project Rules

## Project Overview
FastNetNow (FNN) monitoring dashboard. Node.js/Express backend with SQLite, vanilla HTML/CSS/JS frontend, Python monitoring agents.

## Stack
- **Backend**: Node.js 18+, Express 4, better-sqlite3
- **Frontend**: Vanilla JS (no framework), CSS glassmorphism design system, Chart.js 4
- **Database**: SQLite at `server/data/fnn.db`
- **Agent**: Python 3 with psutil + requests

## Key Commands
- `npm start` - Start server on port 3000
- `npm run seed` - Populate demo data (12 devices, 30 days history)
- `python3 agent/fnn_agent.py --server http://localhost:3000 --once` - Test agent

## Architecture
- Single Express app serves both API and static files
- Frontend polls `/api/dashboard` every 15 seconds
- Python agents POST to `/api/agent/report` every 60 seconds
- SQLite WAL mode for concurrent reads during writes

## Design System
- Follow `design-system-prompt.md` for all visual styles
- Glassmorphism cards with backdrop-filter blur
- CSS custom properties for theming (dark/light/auto)
- Animated gradient background with floating orbs
- Lightning canvas effect between service orbs

## File Organization
- `server/` - Express app (index.js, db.js, routes/)
- `public/` - Static frontend (index.html, css/, js/, assets/)
- `agent/` - Python monitoring agent
- `design-assets/` - Source artwork (preserved, don't modify)

## Rules
- No frontend framework - keep vanilla JS
- Single CSS file per concern (design-system, layout, orbs, cards, charts)
- All API responses are JSON
- SQLite only - no MySQL/PostgreSQL
- Respect prefers-reduced-motion for all animations
- Support dark/light/auto theme modes
