const express = require('express');
const router = express.Router();
const { db, seedLeads } = require('../db');

// GET /api/leads - Query and filter leads
router.get('/', (req, res) => {
  try {
    const {
      search,
      stage,
      priority,
      service,
      owner,
      sort = 'updated_at_desc'
    } = req.query;

    let query = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    if (search && search.trim() !== '') {
      query += ` AND (
        company_name LIKE ? OR 
        contact_person LIKE ? OR 
        email LIKE ? OR 
        phone LIKE ? OR 
        notes LIKE ? OR
        service LIKE ?
      )`;
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (stage && stage !== 'all') {
      query += ' AND stage = ?';
      params.push(stage);
    }

    if (priority && priority !== 'all') {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (service && service !== 'all') {
      query += ' AND service = ?';
      params.push(service);
    }

    if (owner && owner !== 'all') {
      query += ' AND owner = ?';
      params.push(owner);
    }

    // Sort mappings
    switch (sort) {
      case 'value_desc':
        query += ' ORDER BY deal_value DESC';
        break;
      case 'value_asc':
        query += ' ORDER BY deal_value ASC';
        break;
      case 'created_desc':
        query += ' ORDER BY created_at DESC';
        break;
      case 'name_asc':
        query += ' ORDER BY company_name ASC';
        break;
      case 'followup_asc':
        query += ' ORDER BY CASE WHEN next_followup IS NULL OR next_followup = "" THEN 1 ELSE 0 END, next_followup ASC';
        break;
      case 'updated_at_desc':
      default:
        query += ' ORDER BY updated_at DESC';
        break;
    }

    const leads = db.prepare(query).all(...params);
    res.json({ success: true, count: leads.length, data: leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/leads/:id - Get single lead with full activities and tasks
router.get('/:id', (req, res) => {
  try {
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    const activities = db.prepare('SELECT * FROM activities WHERE lead_id = ? ORDER BY created_at DESC').all(req.params.id);
    const tasks = db.prepare('SELECT * FROM tasks WHERE lead_id = ? ORDER BY completed ASC, due_date ASC').all(req.params.id);

    res.json({
      success: true,
      data: {
        ...lead,
        activities,
        tasks
      }
    });
  } catch (error) {
    console.error('Error fetching single lead:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/leads - Create new lead
router.post('/', (req, res) => {
  try {
    const {
      company_name,
      contact_person,
      email = '',
      phone = '',
      website = '',
      location = '',
      service = 'Custom Software Development',
      deal_value = 0,
      currency = 'USD',
      stage = 'New',
      priority = 'Medium',
      source = 'Website',
      owner = 'Alex Mercer',
      probability = 20,
      notes = '',
      next_followup = '',
      expected_close = ''
    } = req.body;

    if (!company_name || !contact_person) {
      return res.status(400).json({ success: false, error: 'Company Name and Contact Person are required' });
    }

    const insertLead = db.prepare(`
      INSERT INTO leads (
        company_name, contact_person, email, phone, website, location,
        service, deal_value, currency, stage, priority, source,
        owner, probability, notes, next_followup, expected_close,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const insertActivity = db.prepare(`
      INSERT INTO activities (lead_id, type, summary, details)
      VALUES (?, ?, ?, ?)
    `);

    let newLeadId;
    const tx = db.transaction(() => {
      const result = insertLead.run(
        company_name, contact_person, email, phone, website, location,
        service, Number(deal_value) || 0, currency, stage, priority, source,
        owner, Number(probability) || 20, notes, next_followup, expected_close
      );
      newLeadId = result.lastInsertRowid;

      insertActivity.run(
        newLeadId,
        'Stage Change',
        `Lead created in stage: ${stage}`,
        `Lead created via ${source} with estimated value ${currency} ${(Number(deal_value) || 0).toLocaleString()}.`
      );

      if (next_followup) {
        db.prepare('INSERT INTO tasks (lead_id, title, due_date, completed) VALUES (?, ?, ?, 0)').run(
          newLeadId,
          `Initial follow-up with ${contact_person}`,
          next_followup
        );
      }
    });

    tx();

    const createdLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(newLeadId);
    res.status(201).json({ success: true, data: createdLead });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/leads/:id - Update lead
router.put('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    const {
      company_name = existing.company_name,
      contact_person = existing.contact_person,
      email = existing.email,
      phone = existing.phone,
      website = existing.website,
      location = existing.location,
      service = existing.service,
      deal_value = existing.deal_value,
      currency = existing.currency,
      stage = existing.stage,
      priority = existing.priority,
      source = existing.source,
      owner = existing.owner,
      probability = existing.probability,
      notes = existing.notes,
      next_followup = existing.next_followup,
      expected_close = existing.expected_close
    } = req.body;

    const tx = db.transaction(() => {
      // Check for stage change to log activity
      if (stage !== existing.stage) {
        db.prepare(`
          INSERT INTO activities (lead_id, type, summary, details)
          VALUES (?, 'Stage Change', ?, ?)
        `).run(
          req.params.id,
          `Stage moved: ${existing.stage} → ${stage}`,
          `Pipeline stage updated from ${existing.stage} to ${stage}`
        );
      }

      // Check for priority change
      if (priority !== existing.priority) {
        db.prepare(`
          INSERT INTO activities (lead_id, type, summary, details)
          VALUES (?, 'Note', ?, ?)
        `).run(
          req.params.id,
          `Priority adjusted to ${priority}`,
          `Changed from ${existing.priority} to ${priority}`
        );
      }

      db.prepare(`
        UPDATE leads SET
          company_name = ?, contact_person = ?, email = ?, phone = ?, website = ?, location = ?,
          service = ?, deal_value = ?, currency = ?, stage = ?, priority = ?, source = ?,
          owner = ?, probability = ?, notes = ?, next_followup = ?, expected_close = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        company_name, contact_person, email, phone, website, location,
        service, Number(deal_value) || 0, currency, stage, priority, source,
        owner, Number(probability) || 0, notes, next_followup, expected_close,
        req.params.id
      );
    });

    tx();

    const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/leads/:id/stage - Fast stage transition (for Drag and Drop / Kanban)
router.patch('/:id/stage', (req, res) => {
  try {
    const { stage } = req.body;
    if (!stage) {
      return res.status(400).json({ success: false, error: 'Stage is required' });
    }

    const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    if (existing.stage === stage) {
      return res.json({ success: true, data: existing });
    }

    let defaultProb = existing.probability;
    if (stage === 'New') defaultProb = 20;
    else if (stage === 'Contacted') defaultProb = 35;
    else if (stage === 'Qualified') defaultProb = 50;
    else if (stage === 'Proposal Sent') defaultProb = 70;
    else if (stage === 'Negotiation') defaultProb = 85;
    else if (stage === 'Closed Won') defaultProb = 100;
    else if (stage === 'Closed Lost') defaultProb = 0;

    const tx = db.transaction(() => {
      db.prepare(`
        UPDATE leads 
        SET stage = ?, probability = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(stage, defaultProb, req.params.id);

      db.prepare(`
        INSERT INTO activities (lead_id, type, summary, details)
        VALUES (?, 'Stage Change', ?, ?)
      `).run(
        req.params.id,
        `Moved to ${stage}`,
        `Pipeline stage transitioned from ${existing.stage} to ${stage}. Probability set to ${defaultProb}%.`
      );
    });

    tx();

    const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating lead stage:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/leads/:id - Delete lead
router.delete('/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/leads/bulk-delete - Delete multiple leads
router.post('/bulk-delete', (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'Array of ids required' });
    }

    const placeholders = ids.map(() => '?').join(',');
    const info = db.prepare(`DELETE FROM leads WHERE id IN (${placeholders})`).run(...ids);

    res.json({ success: true, deletedCount: info.changes });
  } catch (error) {
    console.error('Error bulk deleting leads:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/leads/bulk-stage - Update stage for multiple leads
router.post('/bulk-stage', (req, res) => {
  try {
    const { ids, stage } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !stage) {
      return res.status(400).json({ success: false, error: 'ids array and stage required' });
    }

    const placeholders = ids.map(() => '?').join(',');
    const info = db.prepare(`
      UPDATE leads 
      SET stage = ?, updated_at = datetime('now')
      WHERE id IN (${placeholders})
    `).run(stage, ...ids);

    res.json({ success: true, updatedCount: info.changes });
  } catch (error) {
    console.error('Error bulk updating stages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/leads/import - Bulk import leads from CSV data
router.post('/import', (req, res) => {
  try {
    const { leads } = req.body;
    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ success: false, error: 'Valid leads array required' });
    }

    const insertLead = db.prepare(`
      INSERT INTO leads (
        company_name, contact_person, email, phone, website, location,
        service, deal_value, currency, stage, priority, source,
        owner, probability, notes, next_followup, expected_close,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    let importedCount = 0;
    const tx = db.transaction(() => {
      for (const item of leads) {
        if (!item.company_name || !item.contact_person) continue;

        insertLead.run(
          item.company_name,
          item.contact_person,
          item.email || '',
          item.phone || '',
          item.website || '',
          item.location || '',
          item.service || 'Custom Software Development',
          Number(item.deal_value) || 0,
          item.currency || 'USD',
          item.stage || 'New',
          item.priority || 'Medium',
          item.source || 'CSV Import',
          item.owner || 'Alex Mercer',
          Number(item.probability) || 20,
          item.notes || 'Imported via CSV',
          item.next_followup || '',
          item.expected_close || ''
        );
        importedCount++;
      }
    });

    tx();
    res.json({ success: true, count: importedCount, message: `Successfully imported ${importedCount} leads` });
  } catch (error) {
    console.error('Error importing leads:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/leads/clear-all - Wipe all leads, activities, and tasks completely
router.post('/clear-all', (req, res) => {
  try {
    const tx = db.transaction(() => {
      db.prepare('DELETE FROM activities').run();
      db.prepare('DELETE FROM tasks').run();
      db.prepare('DELETE FROM leads').run();
    });
    tx();
    res.json({ success: true, message: 'All leads and CRM data have been completely cleared.' });
  } catch (error) {
    console.error('Error clearing leads:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/leads/reset-seed - Reset database to sample demo data
router.post('/reset-seed', (req, res) => {
  try {
    const tx = db.transaction(() => {
      db.prepare('DELETE FROM activities').run();
      db.prepare('DELETE FROM tasks').run();
      db.prepare('DELETE FROM leads').run();

      const insertLead = db.prepare(`
        INSERT INTO leads (
          company_name, contact_person, email, phone, website, location,
          service, deal_value, currency, stage, priority, source,
          owner, probability, notes, next_followup, expected_close
        ) VALUES (
          @company_name, @contact_person, @email, @phone, @website, @location,
          @service, @deal_value, @currency, @stage, @priority, @source,
          @owner, @probability, @notes, @next_followup, @expected_close
        )
      `);

      const insertActivity = db.prepare(`
        INSERT INTO activities (lead_id, type, summary, details, created_at)
        VALUES (?, ?, ?, ?, datetime('now', ?))
      `);

      const insertTask = db.prepare(`
        INSERT INTO tasks (lead_id, title, due_date, completed)
        VALUES (?, ?, ?, ?)
      `);

      for (const lead of seedLeads) {
        const result = insertLead.run(lead);
        const leadId = result.lastInsertRowid;

        insertActivity.run(
          leadId,
          'Stage Change',
          `Lead created with initial stage: ${lead.stage}`,
          `Lead captured via ${lead.source}. Initial deal estimate: $${lead.deal_value.toLocaleString()}`,
          '-4 days'
        );

        if (lead.stage !== 'New') {
          insertActivity.run(
            leadId,
            'Call',
            'Discovery & requirements discussion',
            `Covered technical requirements for ${lead.service}. Decision maker: ${lead.contact_person}.`,
            '-2 days'
          );
        }

        if (lead.stage === 'Proposal Sent' || lead.stage === 'Negotiation' || lead.stage === 'Closed Won') {
          insertActivity.run(
            leadId,
            'Proposal',
            'Technical & Financial Proposal Dispatched',
            'Scope of work and pricing breakdown shared with client leadership.',
            '-1 days'
          );
        }

        if (lead.next_followup) {
          insertTask.run(
            leadId,
            `Review next deliverables with ${lead.contact_person}`,
            lead.next_followup,
            0
          );
        }
      }
    });

    tx();
    res.json({ success: true, message: 'Database reset to demo Aigentle leads successfully' });
  } catch (error) {
    console.error('Error resetting seed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
