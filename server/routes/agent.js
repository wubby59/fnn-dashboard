const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

const HEX_COLOR = /^#[0-9A-Fa-f]{3,8}$/;
const MAX_SERVICES = 100;
const MAX_PARTITIONS = 50;
const MAX_FILES = 500;
const MAX_CONNECTIONS = 200;
const MAX_ID_LENGTH = 100;
const MAX_STR_LENGTH = 255;

// Periodic cleanup tracker (run once per hour, not every request)
let lastCleanup = 0;
const CLEANUP_INTERVAL = 60 * 60 * 1000;

function runCleanupIfNeeded(db) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  db.prepare(`DELETE FROM system_stats WHERE reported_at < datetime('now', '-24 hours')`).run();
  db.prepare(`DELETE FROM disk_partitions WHERE reported_at < datetime('now', '-24 hours')`).run();
  db.prepare(`DELETE FROM archive_files WHERE reported_at < datetime('now', '-30 days')`).run();
  db.prepare(`DELETE FROM vpn_connections WHERE reported_at < datetime('now', '-30 days')`).run();
}

function truncate(str, max) {
  if (str == null) return null;
  return String(str).slice(0, max);
}

// Lazy-init prepared statements (created once on first use)
let stmts = null;
function getStmts() {
  if (stmts) return stmts;
  const db = getDb();
  stmts = {
    upsertDevice: db.prepare(`
      INSERT INTO devices (device_id, display_name, ip_address, acronym, orb_color, last_seen)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(device_id) DO UPDATE SET
        display_name = COALESCE(excluded.display_name, devices.display_name),
        ip_address = COALESCE(excluded.ip_address, devices.ip_address),
        acronym = COALESCE(excluded.acronym, devices.acronym),
        orb_color = COALESCE(excluded.orb_color, devices.orb_color),
        last_seen = datetime('now'),
        is_active = 1
    `),
    insertStats: db.prepare(`
      INSERT INTO system_stats (device_id, cpu_usage, free_memory_mb, total_memory_mb, system_uptime)
      VALUES (?, ?, ?, ?, ?)
    `),
    upsertService: db.prepare(`
      INSERT INTO system_services (device_id, service_name, is_running, remote_site, reported_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(device_id, service_name) DO UPDATE SET
        is_running = excluded.is_running,
        remote_site = excluded.remote_site,
        reported_at = datetime('now')
    `),
    insertPartition: db.prepare(`
      INSERT INTO disk_partitions (device_id, partition_name, total_space_mb, free_space_mb, used_space_mb)
      VALUES (?, ?, ?, ?, ?)
    `),
    insertArchive: db.prepare(`
      INSERT INTO archive_files (file_name, file_size_mb, modification_date)
      VALUES (?, ?, ?)
    `),
    insertVpn: db.prepare(`
      INSERT INTO vpn_connections (common_name, bytes_sent, bytes_received, connected_since)
      VALUES (?, ?, ?, ?)
    `)
  };
  return stmts;
}

// POST /api/agent/report - Full device health report
router.post('/report', (req, res) => {
  const db = getDb();
  const {
    device_id, display_name, ip_address, acronym, orb_color,
    cpu_usage, free_memory_mb, total_memory_mb, system_uptime,
    services, partitions
  } = req.body;

  if (!device_id || typeof device_id !== 'string') {
    return res.status(400).json({ error: 'device_id is required' });
  }
  if (device_id.length > MAX_ID_LENGTH) {
    return res.status(400).json({ error: 'device_id too long' });
  }
  if (orb_color && !HEX_COLOR.test(orb_color)) {
    return res.status(400).json({ error: 'Invalid orb_color (hex only)' });
  }
  if (Array.isArray(services) && services.length > MAX_SERVICES) {
    return res.status(400).json({ error: `Too many services (max ${MAX_SERVICES})` });
  }
  if (Array.isArray(partitions) && partitions.length > MAX_PARTITIONS) {
    return res.status(400).json({ error: `Too many partitions (max ${MAX_PARTITIONS})` });
  }

  try {
    const s = getStmts();

    const transaction = db.transaction(() => {
      s.upsertDevice.run(
        device_id,
        truncate(display_name, MAX_STR_LENGTH) || device_id,
        truncate(ip_address, 45) || null,
        truncate(acronym, 20) || device_id.substring(0, 6),
        orb_color || '#0EA5E9'
      );

      if (cpu_usage != null || free_memory_mb != null) {
        s.insertStats.run(device_id, cpu_usage, free_memory_mb, total_memory_mb, system_uptime);
      }

      if (Array.isArray(services)) {
        for (const svc of services) {
          s.upsertService.run(device_id, truncate(svc.service_name, MAX_STR_LENGTH), svc.is_running ? 1 : 0, truncate(svc.remote_site, MAX_STR_LENGTH) || null);
        }
      }

      if (Array.isArray(partitions)) {
        for (const part of partitions) {
          s.insertPartition.run(device_id, truncate(part.partition_name, MAX_STR_LENGTH), part.total_space_mb, part.free_space_mb, part.used_space_mb);
        }
      }
    });

    transaction();
    runCleanupIfNeeded(db);

    res.json({ status: 'ok', device_id });
  } catch (err) {
    console.error('Agent report error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/agent/archive - Archive file sizes
router.post('/archive', (req, res) => {
  const db = getDb();
  const { files } = req.body;

  if (!Array.isArray(files)) {
    return res.status(400).json({ error: 'files array is required' });
  }
  if (files.length > MAX_FILES) {
    return res.status(400).json({ error: `Too many files (max ${MAX_FILES})` });
  }

  try {
    const s = getStmts();

    const transaction = db.transaction(() => {
      for (const file of files) {
        s.insertArchive.run(truncate(file.file_name, MAX_STR_LENGTH), file.file_size_mb, file.modification_date || null);
      }
    });

    transaction();
    res.json({ status: 'ok', count: files.length });
  } catch (err) {
    console.error('Archive report error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/agent/vpn - VPN connection data
router.post('/vpn', (req, res) => {
  const db = getDb();
  const { connections } = req.body;

  if (!Array.isArray(connections)) {
    return res.status(400).json({ error: 'connections array is required' });
  }
  if (connections.length > MAX_CONNECTIONS) {
    return res.status(400).json({ error: `Too many connections (max ${MAX_CONNECTIONS})` });
  }

  try {
    const s = getStmts();

    const transaction = db.transaction(() => {
      for (const conn of connections) {
        s.insertVpn.run(truncate(conn.common_name, MAX_STR_LENGTH), conn.bytes_sent, conn.bytes_received, conn.connected_since || null);
      }
    });

    transaction();
    res.json({ status: 'ok', count: connections.length });
  } catch (err) {
    console.error('VPN report error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
