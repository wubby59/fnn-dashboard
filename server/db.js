const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'fnn.db');

let db = null;

function getDb() {
  if (db) return db;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initSchema();
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS devices (
      device_id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      ip_address TEXT,
      acronym TEXT,
      orb_color TEXT DEFAULT '#0EA5E9',
      priority INTEGER DEFAULT 0,
      watch INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      first_seen TEXT DEFAULT (datetime('now')),
      last_seen TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS system_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      is_running INTEGER DEFAULT 1,
      remote_site TEXT,
      reported_at TEXT DEFAULT (datetime('now')),
      UNIQUE(device_id, service_name)
    );

    CREATE TABLE IF NOT EXISTS system_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      cpu_usage REAL,
      free_memory_mb REAL,
      total_memory_mb REAL,
      system_uptime TEXT,
      reported_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS disk_partitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      partition_name TEXT NOT NULL,
      total_space_mb REAL,
      free_space_mb REAL,
      used_space_mb REAL,
      reported_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS archive_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL,
      file_size_mb REAL,
      modification_date TEXT,
      reported_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vpn_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      common_name TEXT NOT NULL,
      bytes_sent REAL DEFAULT 0,
      bytes_received REAL DEFAULT 0,
      connected_since TEXT,
      reported_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_stats_device_time ON system_stats(device_id, reported_at);
    CREATE INDEX IF NOT EXISTS idx_services_device ON system_services(device_id);
    CREATE INDEX IF NOT EXISTS idx_partitions_device ON disk_partitions(device_id, reported_at);
    CREATE INDEX IF NOT EXISTS idx_archive_time ON archive_files(reported_at);
    CREATE INDEX IF NOT EXISTS idx_archive_file_time ON archive_files(file_name, reported_at);
    CREATE INDEX IF NOT EXISTS idx_vpn_time ON vpn_connections(reported_at);
    CREATE INDEX IF NOT EXISTS idx_vpn_name_time ON vpn_connections(common_name, reported_at);
  `);
}

module.exports = { getDb };
