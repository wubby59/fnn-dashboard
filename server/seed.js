const { getDb } = require('./db');

const DEVICES = [
  { id: 'FW-MAIN',  name: 'Firewall Main',      ip: '10.0.0.1',   acronym: 'FW-MN',  color: '#EF4444', services: ['iptables', 'fail2ban', 'dhcpd'] },
  { id: 'DC-01',    name: 'Domain Controller',   ip: '10.0.0.10',  acronym: 'DC-01',  color: '#8B5CF6', services: ['samba-ad', 'dns', 'kerberos', 'ntp'] },
  { id: 'FS-01',    name: 'File Server',         ip: '10.0.0.20',  acronym: 'FS-01',  color: '#10B981', services: ['smbd', 'nfs-server'] },
  { id: 'WEB-01',   name: 'Web Server',          ip: '10.0.0.30',  acronym: 'WEB-1',  color: '#0EA5E9', services: ['nginx', 'php-fpm', 'certbot'] },
  { id: 'DB-01',    name: 'Database Server',     ip: '10.0.0.40',  acronym: 'DB-01',  color: '#F59E0B', services: ['mysql', 'redis'] },
  { id: 'MAIL-01',  name: 'Mail Server',         ip: '10.0.0.50',  acronym: 'MAIL',   color: '#EC4899', services: ['postfix', 'dovecot', 'spamassassin'] },
  { id: 'MON-01',   name: 'Monitoring Server',   ip: '10.0.0.60',  acronym: 'MON-1',  color: '#06B6D4', services: ['fnn-agent', 'prometheus'] },
  { id: 'BKP-01',   name: 'Backup Server',       ip: '10.0.0.70',  acronym: 'BKP-1',  color: '#84CC16', services: ['rsync', 'borgbackup'] },
  { id: 'CAM-01',   name: 'Camera NVR',          ip: '10.0.0.80',  acronym: 'CAM-1',  color: '#F97316', services: ['zoneminder', 'motion'] },
  { id: 'PRT-01',   name: 'Print Server',        ip: '10.0.0.90',  acronym: 'PRT-1',  color: '#A855F7', services: ['cups'] },
  { id: 'DEV-01',   name: 'Dev Workstation',     ip: '10.0.0.100', acronym: 'DEV-1',  color: '#14B8A6', services: ['docker', 'code-server'] },
  { id: 'VPN-GW',   name: 'VPN Gateway',         ip: '10.0.0.2',   acronym: 'VPN-G',  color: '#6366F1', services: ['openvpn', 'openvpn-status'] },
];

const ARCHIVE_FILES = [
  'backup-dc01.tar.gz', 'backup-fs01.tar.gz', 'backup-db01.tar.gz',
  'backup-web01.tar.gz', 'backup-mail01.tar.gz', 'logs-archive.tar.gz',
  'camera-footage-weekly.tar.gz', 'config-snapshots.tar.gz'
];

const VPN_CLIENTS = ['scott-laptop', 'admin-mobile', 'remote-dev-1', 'field-tech-2', 'backup-site'];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function seed() {
  const db = getDb();

  // Clear existing data
  db.exec(`
    DELETE FROM devices;
    DELETE FROM system_services;
    DELETE FROM system_stats;
    DELETE FROM disk_partitions;
    DELETE FROM archive_files;
    DELETE FROM vpn_connections;
  `);

  const insertDevice = db.prepare(`
    INSERT INTO devices (device_id, display_name, ip_address, acronym, orb_color, priority, watch, first_seen, last_seen)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now'))
  `);

  const insertService = db.prepare(`
    INSERT INTO system_services (device_id, service_name, is_running, remote_site, reported_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(device_id, service_name) DO UPDATE SET
      is_running = excluded.is_running,
      remote_site = excluded.remote_site,
      reported_at = datetime('now')
  `);

  const insertStats = db.prepare(`
    INSERT INTO system_stats (device_id, cpu_usage, free_memory_mb, total_memory_mb, system_uptime, reported_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', ?))
  `);

  const insertPartition = db.prepare(`
    INSERT INTO disk_partitions (device_id, partition_name, total_space_mb, free_space_mb, used_space_mb, reported_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);

  const insertArchive = db.prepare(`
    INSERT INTO archive_files (file_name, file_size_mb, modification_date, reported_at)
    VALUES (?, ?, datetime('now', ?), datetime('now', ?))
  `);

  const insertVpn = db.prepare(`
    INSERT INTO vpn_connections (common_name, bytes_sent, bytes_received, connected_since, reported_at)
    VALUES (?, ?, ?, datetime('now', ?), datetime('now', ?))
  `);

  const transaction = db.transaction(() => {
    // Seed devices + services + current stats
    DEVICES.forEach((dev, i) => {
      const watchFlag = i < 4 ? 1 : 0; // Pin first 4 devices
      insertDevice.run(dev.id, dev.name, dev.ip, dev.acronym, dev.color, DEVICES.length - i, watchFlag, `-${randInt(30, 90)} days`);

      // Services - most running, a few down for realism
      dev.services.forEach((svc, si) => {
        const isDown = (dev.id === 'PRT-01' && svc === 'cups') || (dev.id === 'CAM-01' && svc === 'motion');
        insertService.run(dev.id, svc, isDown ? 0 : 1, dev.ip);
      });

      // Partitions
      const totalRoot = randInt(100000, 500000);
      const usedRoot = randInt(totalRoot * 0.3, totalRoot * 0.85);
      insertPartition.run(dev.id, '/', totalRoot, totalRoot - usedRoot, usedRoot);

      if (['FS-01', 'BKP-01', 'CAM-01', 'DB-01'].includes(dev.id)) {
        const totalData = randInt(500000, 2000000);
        const usedData = randInt(totalData * 0.4, totalData * 0.9);
        insertPartition.run(dev.id, '/data', totalData, totalData - usedData, usedData);
      }

      // 24h of stats history (one per hour)
      const totalMem = [4096, 8192, 16384, 32768][randInt(0, 3)];
      for (let h = 23; h >= 0; h--) {
        const cpuBase = { 'FW-MAIN': 15, 'DC-01': 25, 'DB-01': 45, 'WEB-01': 35, 'CAM-01': 60 }[dev.id] || 20;
        const cpu = Math.min(100, Math.max(1, cpuBase + rand(-10, 15)));
        const freeMem = totalMem * rand(0.15, 0.65);
        const uptimeDays = randInt(1, 120);
        const uptime = `${uptimeDays}d ${randInt(0, 23)}h ${randInt(0, 59)}m`;
        insertStats.run(dev.id, cpu.toFixed(1), freeMem.toFixed(0), totalMem, uptime, `-${h} hours`);
      }
    });

    // 30 days of archive file data
    ARCHIVE_FILES.forEach(fileName => {
      let baseSize = rand(500, 5000);
      for (let d = 29; d >= 0; d--) {
        baseSize += rand(5, 50); // Gradual growth
        insertArchive.run(fileName, baseSize.toFixed(1), `-${d} days`, `-${d} days`);
      }
    });

    // 30 days of VPN data
    VPN_CLIENTS.forEach(client => {
      for (let d = 29; d >= 0; d--) {
        const sent = rand(50, 2000);
        const received = rand(100, 5000);
        insertVpn.run(client, sent.toFixed(0), received.toFixed(0), `-${d} days -${randInt(0, 8)} hours`, `-${d} days`);
      }
    });
  });

  transaction();

  const deviceCount = db.prepare('SELECT COUNT(*) as c FROM devices').get().c;
  const serviceCount = db.prepare('SELECT COUNT(*) as c FROM system_services').get().c;
  const statsCount = db.prepare('SELECT COUNT(*) as c FROM system_stats').get().c;
  const archiveCount = db.prepare('SELECT COUNT(*) as c FROM archive_files').get().c;
  const vpnCount = db.prepare('SELECT COUNT(*) as c FROM vpn_connections').get().c;

  console.log('Seed complete:');
  console.log(`  ${deviceCount} devices`);
  console.log(`  ${serviceCount} services`);
  console.log(`  ${statsCount} stats records (24h)`);
  console.log(`  ${archiveCount} archive records (30d)`);
  console.log(`  ${vpnCount} VPN records (30d)`);
}

if (require.main === module) {
  seed();
}
