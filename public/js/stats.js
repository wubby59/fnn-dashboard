// System Stats card rendering - uses DOM creation to prevent XSS
const Stats = (() => {
  let currentDeviceIds = [];

  function getStatus(device) {
    if (!device.services || device.services.length === 0) return 'up';
    const allUp = device.services.every(s => s.is_running);
    const allDown = device.services.every(s => !s.is_running);
    if (allDown) return 'down';
    if (!allUp) return 'warn';
    return 'up';
  }

  function formatMB(mb) {
    if (mb == null) return '-';
    if (mb >= 1000) return (mb / 1024).toFixed(1) + ' GB';
    return Math.round(mb) + ' MB';
  }

  function isStale(lastSeen) {
    if (!lastSeen) return true;
    const ts = String(lastSeen);
    // Only append Z if no timezone info present
    const dateStr = ts.includes('Z') || ts.includes('+') ? ts : ts + 'Z';
    const diff = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diff)) return true;
    return diff > 2 * 60 * 60 * 1000;
  }

  function ramPct(free, total) {
    if (!total || !free) return 0;
    return ((total - free) / total * 100).toFixed(0);
  }

  function diskPct(used, total) {
    if (!total) return 0;
    return (used / total * 100).toFixed(0);
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function createBar(pct, fillClass) {
    const bar = el('div', 'stat-bar');
    const track = el('div', 'stat-bar__track');
    const fill = el('div', `stat-bar__fill ${pct > 85 ? 'stat-bar__fill--high' : fillClass}`);
    fill.style.width = pct + '%';
    track.appendChild(fill);
    bar.appendChild(track);
    return bar;
  }

  function createRow(label, value) {
    const row = el('div', 'stat-row');
    row.appendChild(el('span', 'stat-row__label', label));
    row.appendChild(el('span', 'stat-row__value', value));
    return row;
  }

  function createCard(device) {
    const stats = device.stats || {};
    const stale = isStale(device.last_seen);
    const cpu = stats.cpu_usage != null ? Number(stats.cpu_usage).toFixed(1) : null;
    const usedPct = ramPct(stats.free_memory_mb, stats.total_memory_mb);

    const status = getStatus(device);
    const card = el('div', 'glass-card-secondary stat-card');
    card.classList.add(`stat-card--${status}`);
    if (stale) card.classList.add('stat-card--stale');
    if (device.watch) card.classList.add('stat-card--pinned');
    card.dataset.deviceId = device.device_id;

    // Header
    const header = el('div', 'stat-card__header');
    const info = el('div');
    info.appendChild(el('div', 'stat-card__name', device.display_name || device.device_id));
    info.appendChild(el('div', 'stat-card__ip', device.ip_address || '-'));
    header.appendChild(info);

    // Action buttons (using addEventListener, not onclick)
    const actions = el('div', 'stat-card__actions');

    const pinBtn = el('button', 'stat-card__action');
    if (device.watch) pinBtn.classList.add('stat-card__action--pinned');
    pinBtn.textContent = device.watch ? '\u2605' : '\u2606';
    pinBtn.title = device.watch ? 'Unpin' : 'Pin';
    pinBtn.addEventListener('click', () => Stats.togglePin(device.device_id, device.watch ? 0 : 1));
    actions.appendChild(pinBtn);

    const delBtn = el('button', 'stat-card__action stat-card__action--delete');
    delBtn.textContent = '\u2716';
    delBtn.title = 'Remove';
    delBtn.addEventListener('click', () => Stats.remove(device.device_id));
    actions.appendChild(delBtn);

    header.appendChild(actions);
    card.appendChild(header);

    // Body - minimal: CPU + RAM free only
    const body = el('div', 'stat-card__body');

    if (cpu != null) {
      body.appendChild(createRow('CPU', cpu + '%'));
      body.appendChild(createBar(cpu, 'stat-bar__fill--cpu'));
    }

    if (stats.total_memory_mb) {
      const ramFree = formatMB(stats.free_memory_mb);
      body.appendChild(createRow('RAM', `${usedPct}%`));
      body.appendChild(createBar(usedPct, 'stat-bar__fill--ram'));
      body.appendChild(createRow('Free', ramFree));
    }

    card.appendChild(body);
    return card;
  }

  function render(devices) {
    const grid = document.getElementById('stats-grid');
    const countEl = document.getElementById('stats-count');
    if (!grid) return;

    if (countEl) countEl.textContent = `${devices.length} devices`;

    const sorted = [...devices].sort((a, b) => {
      if (a.watch !== b.watch) return b.watch - a.watch;
      return (b.priority || 0) - (a.priority || 0);
    });

    // Check if device list changed
    const newIds = sorted.map(d => d.device_id).join(',');
    if (newIds === currentDeviceIds.join(',') && grid.children.length > 0) {
      // In-place update of existing cards
      sorted.forEach(device => {
        const card = grid.querySelector(`[data-device-id="${CSS.escape(device.device_id)}"]`);
        if (!card) return;
        // Replace entire card content for simplicity (card is already in DOM, no animation reset)
        const newCard = createCard(device);
        card.replaceWith(newCard);
      });
      return;
    }

    // Full rebuild
    currentDeviceIds = sorted.map(d => d.device_id);
    grid.innerHTML = '';
    sorted.forEach(device => {
      grid.appendChild(createCard(device));
    });
  }

  async function togglePin(deviceId, watch) {
    try {
      await API.toggleWatch(deviceId, watch);
      App.fetchAndRender();
    } catch (err) {
      console.error('Toggle pin error:', err);
    }
  }

  async function remove(deviceId) {
    if (!confirm(`Remove device ${deviceId}?`)) return;
    try {
      await API.deleteDevice(deviceId);
      App.fetchAndRender();
    } catch (err) {
      console.error('Delete error:', err);
    }
  }

  return { render, togglePin, remove };
})();
