// Service Orb rendering - uses DOM creation to prevent XSS
const Orbs = (() => {
  const DRIFT_CLASSES = ['service-orb-wrapper--drift-1', 'service-orb-wrapper--drift-2', 'service-orb-wrapper--drift-3', 'service-orb-wrapper--drift-4'];
  let currentDeviceIds = [];

  function getStatus(device) {
    if (!device.services || device.services.length === 0) return 'up';
    const allUp = device.services.every(s => s.is_running);
    const allDown = device.services.every(s => !s.is_running);
    if (allDown) return 'down';
    if (!allUp) return 'warn';
    return 'up';
  }

  function getLastOctet(ip) {
    if (!ip) return '';
    const parts = String(ip).split('.');
    return '.' + parts[parts.length - 1];
  }

  function createOrb(device, index) {
    const status = getStatus(device);
    const drift = DRIFT_CLASSES[index % DRIFT_CLASSES.length];
    const delay = (index * 1.7).toFixed(1);
    const color = sanitizeColor(device.orb_color);

    // Wrapper for drift animation (separates drift from hover scale)
    const wrapper = document.createElement('div');
    wrapper.className = `service-orb-wrapper ${drift}`;
    wrapper.style.animationDelay = `-${delay}s`;

    const orb = document.createElement('div');
    orb.className = `service-orb service-orb--${status}`;
    orb.dataset.deviceId = device.device_id;
    orb.title = `${device.display_name || ''} (${device.ip_address || ''})`;

    const glow = document.createElement('div');
    glow.className = 'service-orb__glow';
    glow.style.background = color;

    const body = document.createElement('div');
    body.className = 'service-orb__body';

    const acronym = document.createElement('span');
    acronym.className = 'service-orb__acronym';
    acronym.textContent = device.acronym || device.device_id || '';

    const ip = document.createElement('span');
    ip.className = 'service-orb__ip';
    ip.textContent = getLastOctet(device.ip_address);

    const statusDot = document.createElement('div');
    statusDot.className = `service-orb__status service-orb__status--${status}`;

    body.appendChild(acronym);
    body.appendChild(ip);
    orb.appendChild(glow);
    orb.appendChild(body);
    orb.appendChild(statusDot);
    wrapper.appendChild(orb);
    return wrapper;
  }

  function populateField(field, devices) {
    field.innerHTML = '';
    devices.forEach((device, i) => {
      field.appendChild(createOrb(device, i));
    });

    // Clone orb set for seamless marquee loop
    const originals = Array.from(field.children);
    originals.forEach(wrapper => {
      const clone = wrapper.cloneNode(true);
      clone.classList.add('service-orb-wrapper--clone');
      field.appendChild(clone);
    });
  }

  function updateFieldOrbs(field, devices) {
    devices.forEach(device => {
      const orbs = field.querySelectorAll(`.service-orb[data-device-id="${CSS.escape(device.device_id)}"]`);
      if (orbs.length === 0) return;
      orbs.forEach(orb => {
        const status = getStatus(device);
        orb.className = `service-orb service-orb--${status}`;

        const dot = orb.querySelector('.service-orb__status');
        if (dot) dot.className = `service-orb__status service-orb__status--${status}`;

        const acr = orb.querySelector('.service-orb__acronym');
        if (acr) acr.textContent = device.acronym || device.device_id || '';
        const ipEl = orb.querySelector('.service-orb__ip');
        if (ipEl) ipEl.textContent = getLastOctet(device.ip_address);
      });
    });
  }

  function render(devices) {
    const field1 = document.getElementById('orbs-field-1');
    const field2 = document.getElementById('orbs-field-2');
    const countEl = document.getElementById('orbs-count');
    if (!field1 || !field2) return;

    // Count total services
    let totalServices = 0;
    devices.forEach(d => { totalServices += (d.services || []).length; });
    if (countEl) countEl.textContent = `${totalServices} across ${devices.length} devices`;

    // Split devices into two rows (alternating for even distribution)
    const row1Devices = devices.filter((_, i) => i % 2 === 0);
    const row2Devices = devices.filter((_, i) => i % 2 === 1);

    // Check if device list changed (avoid destroying DOM / resetting animations)
    const newIds = devices.map(d => d.device_id).join(',');
    if (newIds === currentDeviceIds.join(',')) {
      updateFieldOrbs(field1, row1Devices);
      updateFieldOrbs(field2, row2Devices);
      return;
    }

    // Full rebuild only when device list changes
    currentDeviceIds = devices.map(d => d.device_id);
    populateField(field1, row1Devices);
    populateField(field2, row2Devices);
  }

  return { render };
})();
