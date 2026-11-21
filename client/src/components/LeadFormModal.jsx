import React, { useState } from 'react';
import { 
  STAGES, 
  PRIORITIES, 
  SERVICES, 
  SOURCES, 
  OWNERS, 
  CURRENCY_SYMBOLS 
} from '../constants/crm';
import { X, Building2, User, DollarSign, Calendar, Sparkles } from 'lucide-react';

export default function LeadFormModal({ isOpen, onClose, onSave, currency }) {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    service: SERVICES[0],
    deal_value: '',
    currency: currency || 'INR',
    stage: 'New',
    priority: 'Medium',
    source: 'Website',
    owner: OWNERS[0],
    probability: 20,
    notes: '',
    next_followup: '',
    expected_close: ''
  });

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleStageChange = (newStage) => {
    let prob = 20;
    if (newStage === 'Contacted') prob = 35;
    else if (newStage === 'Qualified') prob = 50;
    else if (newStage === 'Proposal Sent') prob = 70;
    else if (newStage === 'Negotiation') prob = 85;
    else if (newStage === 'Closed Won') prob = 100;
    else if (newStage === 'Closed Lost') prob = 0;

    setFormData({
      ...formData,
      stage: newStage,
      probability: prob
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.contact_person) {
      alert('Please provide Company Name and Contact Person.');
      return;
    }

    try {
      setSaving(true);
      await onSave({
        ...formData,
        deal_value: Number(formData.deal_value) || 0,
        currency: currency
      });
      onClose();
    } catch (err) {
      console.error('Error saving lead:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add New IT Service Lead</h2>
              <p className="text-xs text-slate-400">Capture client details, service requirements, and deal sizing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Row 1: Company & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Company / Organization Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Tech Solutions Inc"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Contact Person Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe (CTO / VP Eng)"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="john@acmetech.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Phone / WhatsApp Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Row 3: Service & Estimated Deal Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-medium block mb-1">IT Service Required</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Estimated Deal Value ({CURRENCY_SYMBOLS[currency] || '$'})
              </label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={formData.deal_value}
                onChange={(e) => setFormData({ ...formData, deal_value: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Row 4: Pipeline Stage & Win Probability */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Pipeline Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => handleStageChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Win Probability (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Row 5: Source, Owner, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Lead Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SOURCES.map(src => <option key={src} value={src}>{src}</option>)}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Account Owner</label>
              <select
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Location / HQ</label>
              <input
                type="text"
                placeholder="e.g. New York, USA"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Row 6: Next Follow-up & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Scheduled Next Follow-up</label>
              <input
                type="datetime-local"
                value={formData.next_followup}
                onChange={(e) => setFormData({ ...formData, next_followup: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Website URL</label>
              <input
                type="text"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-slate-300 font-medium block mb-1">Technical Notes & Project Scope</label>
            <textarea
              rows="3"
              placeholder="Key pain points, existing infrastructure, project timelines, budget constraints..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
            >
              {saving ? 'Creating...' : 'Create Lead'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
