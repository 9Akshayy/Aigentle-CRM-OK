const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/tasks - Retrieve tasks with lead context
router.get('/', (req, res) => {
  try {
    const { status = 'all' } = req.query;

    let query = `
      SELECT t.*, l.company_name, l.contact_person, l.phone, l.email, l.service, l.priority
      FROM tasks t
      JOIN leads l ON t.lead_id = l.id
    `;
    const params = [];

    if (status === 'pending') {
      query += ' WHERE t.completed = 0';
    } else if (status === 'completed') {
      query += ' WHERE t.completed = 1';
    }

    query += ' ORDER BY t.completed ASC, t.due_date ASC';

    const tasks = db.prepare(query).all(...params);
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/tasks - Create task
router.post('/', (req, res) => {
  try {
    const { lead_id, title, due_date } = req.body;

    if (!lead_id || !title || !due_date) {
      return res.status(400).json({ success: false, error: 'lead_id, title, and due_date are required' });
    }

    const insert = db.prepare(`
      INSERT INTO tasks (lead_id, title, due_date, completed, created_at)
      VALUES (?, ?, ?, 0, datetime('now'))
    `);

    const result = insert.run(lead_id, title, due_date);

    // Update lead next_followup date if earlier or empty
    const lead = db.prepare('SELECT next_followup FROM leads WHERE id = ?').get(lead_id);
    if (!lead.next_followup || new Date(due_date) < new Date(lead.next_followup)) {
      db.prepare('UPDATE leads SET next_followup = ?, updated_at = datetime("now") WHERE id = ?').run(due_date, lead_id);
    }

    const created = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/tasks/:id/toggle - Mark task as completed or pending
router.patch('/:id/toggle', (req, res) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const newCompleted = task.completed === 1 ? 0 : 1;
    db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(newCompleted, req.params.id);

    // If marked completed, log an activity
    if (newCompleted === 1) {
      db.prepare(`
        INSERT INTO activities (lead_id, type, summary, details)
        VALUES (?, 'Call', ?, ?)
      `).run(task.lead_id, `Completed task: ${task.title}`, `Task completed at ${new Date().toLocaleString()}`);
    }

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
