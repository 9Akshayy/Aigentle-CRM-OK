const API_BASE = '/api';

export const crmApi = {
  // Leads
  async getLeads(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await fetch(`${API_BASE}/leads?${query.toString()}`);
    return res.json();
  },

  async getLead(id) {
    const res = await fetch(`${API_BASE}/leads/${id}`);
    return res.json();
  },

  async createLead(data) {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateLead(id, data) {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateLeadStage(id, stage) {
    const res = await fetch(`${API_BASE}/leads/${id}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    return res.json();
  },

  async deleteLead(id) {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async bulkDeleteLeads(ids) {
    const res = await fetch(`${API_BASE}/leads/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    return res.json();
  },

  async bulkUpdateStage(ids, stage) {
    const res = await fetch(`${API_BASE}/leads/bulk-stage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, stage }),
    });
    return res.json();
  },

  async importLeads(leads) {
    const res = await fetch(`${API_BASE}/leads/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leads }),
    });
    return res.json();
  },

  async resetSeed() {
    const res = await fetch(`${API_BASE}/leads/reset-seed`, {
      method: 'POST',
    });
    return res.json();
  },

  async clearAllLeads() {
    const res = await fetch(`${API_BASE}/leads/clear-all`, {
      method: 'POST',
    });
    return res.json();
  },

  // Activities
  async getActivities(params = {}) {
    const query = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/activities?${query.toString()}`);
    return res.json();
  },

  async logActivity(data) {
    const res = await fetch(`${API_BASE}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Tasks
  async getTasks(status = 'all') {
    const res = await fetch(`${API_BASE}/tasks?status=${status}`);
    return res.json();
  },

  async createTask(data) {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async toggleTask(id) {
    const res = await fetch(`${API_BASE}/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
    return res.json();
  },

  async deleteTask(id) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Analytics Stats
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },

  // Email Templates
  async getTemplates() {
    const res = await fetch(`${API_BASE}/templates`);
    return res.json();
  },
};
