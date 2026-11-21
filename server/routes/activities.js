const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/activities - Get recent activities across all leads or for specific lead
router.get('/', (req, res) => {
  try {
    const { lead_id, limit = 50 } = req.query;

    let query = `
      SELECT a.*, l.company_name, l.contact_person 
      FROM activities a
      JOIN leads l ON a.lead_id = l.id
    `;
    const params = [];

    if (lead_id) {
      query += ' WHERE a.lead_id = ?';
      params.push(lead_id);
    }

    query += ' ORDER BY a.created_at DESC LIMIT ?';
    params.push(Number(limit) || 50);

    const activities = db.prepare(query).all(...params);
    res.json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/activities - Log new activity
router.post('/', (req, res) => {
  try {
    const { lead_id, type = 'Note', summary, details = '' } = req.body;

    if (!lead_id || !summary) {
      return res.status(400).json({ success: false, error: 'lead_id and summary are required' });
    }

    const insert = db.prepare(`
      INSERT INTO activities (lead_id, type, summary, details, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);

    const result = insert.run(lead_id, type, summary, details);

    // Also bump lead's updated_at timestamp
    db.prepare(`UPDATE leads SET updated_at = datetime('now') WHERE id = ?`).run(lead_id);

    const created = db.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
