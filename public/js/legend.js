// Footer orb legend - uses DOM creation to prevent XSS
const Legend = (() => {
  function render(devices) {
    const container = document.getElementById('legend-container');
    if (!container) return;

    container.innerHTML = '';
    devices.forEach(device => {
      const color = sanitizeColor(device.orb_color);

      const item = document.createElement('span');
      item.className = 'legend-item';
      item.title = `${device.display_name || ''} (${device.ip_address || ''})`;

      const dot = document.createElement('span');
      dot.className = 'legend-dot';
      dot.style.background = color;

      const label = document.createElement('span');
      label.className = 'legend-label';
      label.textContent = device.acronym || device.device_id || '';

      item.appendChild(dot);
      item.appendChild(label);
      container.appendChild(item);
    });
  }

  return { render };
})();
