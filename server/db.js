const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'crm.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency & performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      contact_person TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      website TEXT,
      location TEXT,
      service TEXT NOT NULL,
      deal_value REAL DEFAULT 0,
      currency TEXT DEFAULT 'INR',
      stage TEXT DEFAULT 'New',
      priority TEXT DEFAULT 'Medium',
      source TEXT DEFAULT 'Website',
      owner TEXT DEFAULT 'Alex Mercer',
      probability INTEGER DEFAULT 20,
      division TEXT DEFAULT 'Mobile App Division',
      is_verified INTEGER DEFAULT 0,
      notes TEXT,
      next_followup TEXT,
      expected_close TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      summary TEXT NOT NULL,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      due_date TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
    CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
    CREATE INDEX IF NOT EXISTS idx_leads_service ON leads(service);
    CREATE INDEX IF NOT EXISTS idx_activities_lead ON activities(lead_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_lead ON tasks(lead_id);
  `);

  try {
    db.exec("ALTER TABLE leads ADD COLUMN is_verified INTEGER DEFAULT 0");
  } catch (e) {}

  try {
    db.exec("ALTER TABLE leads ADD COLUMN division TEXT DEFAULT 'Mobile App Division'");
  } catch (e) {}

  try {
    db.exec("CREATE INDEX IF NOT EXISTS idx_leads_division ON leads(division)");
    db.exec("CREATE INDEX IF NOT EXISTS idx_leads_verified ON leads(is_verified)");
  } catch (e) {}
}

// Initial seed data representing real-world IT Services leads for Aigentle
const seedLeads = [
  {
    company_name: 'Apex FinTech Solutions',
    contact_person: 'Sophia Vance',
    email: 's.vance@apexfintech.io',
    phone: '+1 (555) 234-8901',
    website: 'https://apexfintech.io',
    location: 'San Francisco, CA',
    service: 'AI & Machine Learning Solutions',
    deal_value: 65000,
    currency: 'USD',
    stage: 'Proposal Sent',
    priority: 'Urgent',
    source: 'LinkedIn',
    owner: 'Alex Mercer',
    probability: 75,
    notes: 'Interested in enterprise RAG pipeline for automated compliance auditing and predictive financial fraud detection. Sent preliminary technical architecture.',
    next_followup: new Date(Date.now() + 86400000 * 1).toISOString(), // Tomorrow
    expected_close: '2026-12-15'
  },
  {
    company_name: 'BioPulse HealthTech',
    contact_person: 'Dr. Marcus Reynolds',
    email: 'm.reynolds@biopulsehealth.com',
    phone: '+1 (555) 872-3104',
    website: 'https://biopulsehealth.com',
    location: 'Boston, MA',
    service: 'Cloud & DevOps Architecture',
    deal_value: 48000,
    currency: 'USD',
    stage: 'Qualified',
    priority: 'High',
    source: 'Referral',
    owner: 'Elena Rostova',
    probability: 60,
    notes: 'Migrating legacy on-prem electronic health record workloads to HIPAA-compliant AWS multi-region Kubernetes cluster.',
    next_followup: new Date(Date.now() + 86400000 * 2).toISOString(),
    expected_close: '2026-12-28'
  },
  {
    company_name: 'Nexus Retail Omnichannel',
    contact_person: 'Priya Sharma',
    email: 'priya.s@nexusretail.in',
    phone: '+91 98201 54321',
    website: 'https://nexusretail.in',
    location: 'Bengaluru, India',
    service: 'Custom Software Development',
    deal_value: 35000,
    currency: 'USD',
    stage: 'Negotiation',
    priority: 'High',
    source: 'Website',
    owner: 'Rajesh Nair',
    probability: 85,
    notes: 'Full-stack unified warehouse management system with real-time inventory synchronization across 140 physical outlets.',
    next_followup: new Date(Date.now() + 86400000 * 1).toISOString(),
    expected_close: '2026-11-30'
  },
  {
    company_name: 'CloudScale Logistics',
    contact_person: 'David Chen',
    email: 'david.chen@cloudscalelog.com',
    phone: '+1 (555) 439-0912',
    website: 'https://cloudscalelog.com',
    location: 'Chicago, IL',
    service: 'Mobile App Development',
    deal_value: 42000,
    currency: 'USD',
    stage: 'New',
    priority: 'Medium',
    source: 'Google Ads',
    owner: 'Alex Mercer',
    probability: 25,
    notes: 'Fleet tracking and offline-first driver logistics application built in Flutter with barcode and signature scanner.',
    next_followup: new Date(Date.now() - 86400000 * 1).toISOString(), // Overdue reminder
    expected_close: '2027-01-20'
  },
  {
    company_name: 'Quantum Security Labs',
    contact_person: 'Helena Berg',
    email: 'hberg@quantumseclabs.de',
    phone: '+49 30 901820',
    website: 'https://quantumseclabs.de',
    location: 'Berlin, Germany',
    service: 'Cybersecurity & Compliance',
    deal_value: 55000,
    currency: 'USD',
    stage: 'Contacted',
    priority: 'Medium',
    source: 'Tech Event/Webinar',
    owner: 'Elena Rostova',
    probability: 40,
    notes: 'Comprehensive SOC2 Type II audit readiness, automated vulnerability scanning, and red-team penetration testing.',
    next_followup: new Date(Date.now() + 86400000 * 3).toISOString(),
    expected_close: '2027-02-10'
  },
  {
    company_name: 'Vanguard Media Group',
    contact_person: 'Robert Sterling',
    email: 'rsterling@vanguardmedia.com',
    phone: '+1 (555) 782-9900',
    website: 'https://vanguardmedia.com',
    location: 'New York, NY',
    service: 'Managed IT Support & Staffing',
    deal_value: 92000,
    currency: 'USD',
    stage: 'Closed Won',
    priority: 'Urgent',
    source: 'Referral',
    owner: 'Rajesh Nair',
    probability: 100,
    notes: 'Contract signed! Providing 4 senior AI engineers and 2 DevOps architects for a 12-month digital transformation roadmap.',
    next_followup: '',
    expected_close: '2026-11-10'
  },
  {
    company_name: 'InnoTech Ventures',
    contact_person: 'Sarah Jenkins',
    email: 'sjenkins@innotech.vc',
    phone: '+1 (555) 601-2299',
    website: 'https://innotech.vc',
    location: 'Austin, TX',
    service: 'AI & Machine Learning Solutions',
    deal_value: 28000,
    currency: 'USD',
    stage: 'Closed Lost',
    priority: 'Low',
    source: 'Cold Outreach',
    owner: 'Alex Mercer',
    probability: 0,
    notes: 'Postponed project until Q3 next year due to internal budget restructuring.',
    next_followup: '',
    expected_close: '2026-10-30'
  },
  {
    company_name: 'Stratis Global Insurance',
    contact_person: 'Amitabh Sen',
    email: 'a.sen@stratisinsurance.co.uk',
    phone: '+44 20 7946 0192',
    website: 'https://stratisinsurance.co.uk',
    location: 'London, UK',
    service: 'Cloud & DevOps Architecture',
    deal_value: 78000,
    currency: 'USD',
    stage: 'Proposal Sent',
    priority: 'High',
    source: 'LinkedIn',
    owner: 'Elena Rostova',
    probability: 70,
    notes: 'Multi-cloud disaster recovery setup with automated failover between Azure UK South and AWS Ireland.',
    next_followup: new Date(Date.now() + 86400000 * 2).toISOString(),
    expected_close: '2026-12-20'
  }
];

function seedDatabaseIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as total FROM leads').get().total;
  if (count === 0) {
    console.log('Seeding initial Aigentle IT Services leads...');
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

    const tx = db.transaction(() => {
      for (const lead of seedLeads) {
        const result = insertLead.run(lead);
        const leadId = result.lastInsertRowid;

        // Add some realistic history
        insertActivity.run(
          leadId,
          'Stage Change',
          `Lead created with initial stage: ${lead.stage}`,
          `Lead captured via ${lead.source}. Initial deal estimate: $${lead.deal_value.toLocaleString()}`,
          '-5 days'
        );

        if (lead.stage !== 'New') {
          insertActivity.run(
            leadId,
            'Call',
            'Discovery & requirements discussion',
            `Covered technical requirements for ${lead.service}. Client key decision maker: ${lead.contact_person}.`,
            '-3 days'
          );
        }

        if (lead.stage === 'Proposal Sent' || lead.stage === 'Negotiation' || lead.stage === 'Closed Won') {
          insertActivity.run(
            leadId,
            'Proposal',
            'Statement of Work & Architecture Scope Sent',
            'Sent comprehensive PDF proposal with pricing tiers and milestone delivery schedules.',
            '-1 days'
          );
        }

        if (lead.next_followup) {
          insertTask.run(
            leadId,
            `Follow-up call with ${lead.contact_person} (${lead.company_name})`,
            lead.next_followup,
            0
          );
        }
      }
    });

    tx();
    console.log('Database seeded successfully with Aigentle demo leads!');
  }
}

function clearAllData() {
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM activities').run();
    db.prepare('DELETE FROM tasks').run();
    db.prepare('DELETE FROM leads').run();
  });
  tx();
  console.log('CRM Database wiped clean. Ready for real user leads.');
}

initSchema();
// Auto-seeding disabled to keep CRM completely clean for user leads

module.exports = {
  db,
  initSchema,
  seedDatabaseIfEmpty,
  clearAllData,
  seedLeads
};
