const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// GET /api/dashboard - Combined data for entire UI
router.get('/dashboard', (req, res) => {
  const db = getDb();

  try {
    const devices = db.prepare(`
      SELECT * FROM devices WHERE is_active = 1 ORDER BY watch DESC, priority DESC, display_name ASC
    `).all();

    const services = db.prepare(`
      SELECT * FROM system_services ORDER BY device_id, service_name
    `).all();

    // Latest stats per device
    const latestStats = db.prepare(`
      SELECT s.* FROM system_stats s
      INNER JOIN (
        SELECT device_id, MAX(reported_at) as max_time
        FROM system_stats
        GROUP BY device_id
      ) latest ON s.device_id = latest.device_id AND s.reported_at = latest.max_time
    `).all();

    // Latest partitions per device
    const latestPartitions = db.prepare(`
      SELECT p.* FROM disk_partitions p
      INNER JOIN (
        SELECT device_id, partition_name, MAX(reported_at) as max_time
        FROM disk_partitions
        GROUP BY device_id, partition_name
      ) latest ON p.device_id = latest.device_id
        AND p.partition_name = latest.partition_name
        AND p.reported_at = latest.max_time
    `).all();

    // Group services, stats, partitions by device
    const deviceMap = {};
    for (const dev of devices) {
      deviceMap[dev.device_id] = {
        ...dev,
        services: [],
        stats: null,
        partitions: []
      };
    }

    for (const svc of services) {
      if (deviceMap[svc.device_id]) {
        deviceMap[svc.device_id].services.push(svc);
      }
    }

    for (const stat of latestStats) {
      if (deviceMap[stat.device_id]) {
        deviceMap[stat.device_id].stats = stat;
      }
    }

    for (const part of latestPartitions) {
      if (deviceMap[part.device_id]) {
        deviceMap[part.device_id].partitions.push(part);
      }
    }

    res.json({
      devices: Object.values(deviceMap),
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/archive - 30-day archive growth data
router.get('/archive', (req, res) => {
  const db = getDb();

  try {
    const files = db.prepare(`
      SELECT file_name, file_size_mb, modification_date, reported_at
      FROM archive_files
      WHERE reported_at > datetime('now', '-30 days')
      ORDER BY file_name, reported_at
    `).all();

    // Group by file_name for charting
    const grouped = {};
    for (const f of files) {
      if (!grouped[f.file_name]) grouped[f.file_name] = [];
      grouped[f.file_name].push({
        size_mb: f.file_size_mb,
        date: f.reported_at
      });
    }

    res.json({ files: grouped });
  } catch (err) {
    console.error('Archive error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/vpn - 30-day VPN traffic data
router.get('/vpn', (req, res) => {
  const db = getDb();

  try {
    const connections = db.prepare(`
      SELECT common_name, bytes_sent, bytes_received, connected_since, reported_at
      FROM vpn_connections
      WHERE reported_at > datetime('now', '-30 days')
      ORDER BY common_name, reported_at
    `).all();

    // Group by common_name for charting
    const grouped = {};
    for (const c of connections) {
      if (!grouped[c.common_name]) grouped[c.common_name] = [];
      grouped[c.common_name].push({
        sent: c.bytes_sent,
        received: c.bytes_received,
        date: c.reported_at
      });
    }

    res.json({ connections: grouped });
  } catch (err) {
    console.error('VPN error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/counts - Summary counts for nav badges
router.get('/counts', (req, res) => {
  const db = getDb();

  try {
    const services = db.prepare('SELECT COUNT(*) as count FROM system_services').get();
    const devices = db.prepare('SELECT COUNT(*) as count FROM devices WHERE is_active = 1').get();
    const files = db.prepare(`
      SELECT COUNT(DISTINCT file_name) as count FROM archive_files
      WHERE reported_at > datetime('now', '-30 days')
    `).get();

    res.json({
      services: services.count,
      devices: devices.count,
      files: files.count
    });
  } catch (err) {
    console.error('Counts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
