const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

const HEX_COLOR = /^#[0-9A-Fa-f]{3,8}$/;

// PUT /api/admin/devices/:id/watch - Toggle pinned status
router.put('/devices/:id/watch', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { watch } = req.body;

  try {
    const result = db.prepare('UPDATE devices SET watch = ? WHERE device_id = ?').run(watch ? 1 : 0, id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json({ status: 'ok', device_id: id, watch: watch ? 1 : 0 });
  } catch (err) {
    console.error('Admin watch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/devices/:id - Update device details
router.put('/devices/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { display_name, acronym, orb_color } = req.body;

  if (orb_color !== undefined && !HEX_COLOR.test(orb_color)) {
    return res.status(400).json({ error: 'Invalid orb_color (hex only)' });
  }

  try {
    const fields = [];
    const values = [];

    if (display_name !== undefined) { fields.push('display_name = ?'); values.push(display_name); }
    if (acronym !== undefined) { fields.push('acronym = ?'); values.push(acronym); }
    if (orb_color !== undefined) { fields.push('orb_color = ?'); values.push(orb_color); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const result = db.prepare(`UPDATE devices SET ${fields.join(', ')} WHERE device_id = ?`).run(...values);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json({ status: 'ok', device_id: id });
  } catch (err) {
    console.error('Admin update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/devices/:id - Soft-delete device
router.delete('/devices/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;

  try {
    const result = db.prepare('UPDATE devices SET is_active = 0 WHERE device_id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json({ status: 'ok', device_id: id });
  } catch (err) {
    console.error('Admin delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
