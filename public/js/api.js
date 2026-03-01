// HTML escape utility to prevent XSS
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Validate CSS color values (hex only)
function sanitizeColor(color) {
  if (!color) return '#0EA5E9';
  return /^#[0-9A-Fa-f]{3,8}$/.test(color) ? color : '#0EA5E9';
}

// Fetch wrapper for FNN API
const API = {
  async get(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET ${url}: ${res.status}`);
    return res.json();
  },

  async post(url, data) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`POST ${url}: ${res.status}`);
    return res.json();
  },

  async put(url, data) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`PUT ${url}: ${res.status}`);
    return res.json();
  },

  async del(url) {
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) throw new Error(`DELETE ${url}: ${res.status}`);
    return res.json();
  },

  dashboard() { return this.get('/api/dashboard'); },
  archive()   { return this.get('/api/archive'); },
  vpn()       { return this.get('/api/vpn'); },
  counts()    { return this.get('/api/counts'); },

  toggleWatch(id, watch) { return this.put(`/api/admin/devices/${id}/watch`, { watch }); },
  updateDevice(id, data) { return this.put(`/api/admin/devices/${id}`, data); },
  deleteDevice(id)       { return this.del(`/api/admin/devices/${id}`); }
};
