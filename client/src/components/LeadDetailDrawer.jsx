import React, { useState, useEffect } from 'react';
import { 
  STAGES, 
  PRIORITIES, 
  SERVICES, 
  OWNERS, 
  FORMAT_CURRENCY 
} from '../constants/crm';
import { crmApi } from '../api/crmApi';
import { 
  X, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Tag, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Plus, 
  MessageSquare, 
  FileText, 
  Trash2, 
  Edit3, 
  Sparkles,
  ExternalLink,
  MessageCircle,
  Briefcase
} from 'lucide-react';

export default function LeadDetailDrawer({
  leadId,
  onClose,
  onUpdateLead,
  onDeleteLead,
  onOpenEmailTemplate,
  currency
}) {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Activity form state
  const [actType, setActType] = useState('Call');
  const [actSummary, setActSummary] = useState('');
  const [actDetails, setActDetails] = useState('');
  const [savingActivity, setSavingActivity] = useState(false);

  // New task state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  // Fetch full lead details
  const fetchLead = async () => {
    if (!leadId) return;
    try {
      setLoading(true);
      const res = await crmApi.getLead(leadId);
      if (res.success) {
        setLead(res.data);
        setEditForm(res.data);
      }
    } catch (err) {
      console.error('Error fetching lead details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  if (!leadId) return null;

  // Handle stage change directly from stage bar
  const handleStageChange = async (newStage) => {
    try {
      const res = await crmApi.updateLeadStage(leadId, newStage);
      if (res.success) {
        onUpdateLead(res.data);
        fetchLead();
      }
    } catch (err) {
      console.error('Error updating stage:', err);
    }
  };

  // Handle saving edit form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await crmApi.updateLead(leadId, editForm);
      if (res.success) {
        setIsEditing(false);
        onUpdateLead(res.data);
        fetchLead();
      }
    } catch (err) {
      console.error('Error updating lead:', err);
    }
  };

  // Handle logging activity
  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!actSummary.trim()) return;

    try {
      setSavingActivity(true);
      const res = await crmApi.logActivity({
        lead_id: leadId,
        type: actType,
        summary: actSummary.trim(),
        details: actDetails.trim()
      });

      if (res.success) {
        setActSummary('');
        setActDetails('');
        fetchLead();
      }
    } catch (err) {
      console.error('Error adding activity:', err);
    } finally {
      setSavingActivity(false);
    }
  };

  // Handle adding follow-up task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDue) return;

    try {
      setSavingTask(true);
      const res = await crmApi.createTask({
        lead_id: leadId,
        title: newTaskTitle.trim(),
        due_date: newTaskDue
      });

      if (res.success) {
        setNewTaskTitle('');
        setNewTaskDue('');
        fetchLead();
      }
    } catch (err) {
      console.error('Error adding task:', err);
    } finally {
      setSavingTask(false);
    }
  };

  // Toggle task complete
  const handleToggleTask = async (taskId) => {
    try {
      await crmApi.toggleTask(taskId);
      fetchLead();
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    try {
      await crmApi.deleteTask(taskId);
      fetchLead();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const priorityConfig = lead ? (PRIORITIES.find(p => p.id === lead.priority) || PRIORITIES[2]) : PRIORITIES[2];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl z-10 overflow-y-auto">
        
        {loading || !lead ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-slate-400 flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Loading lead details...
            </div>
          </div>
        ) : (
          <>
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/60 sticky top-0 z-20 backdrop-blur-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${priorityConfig.color}`}>
                      {lead.priority} Priority
                    </span>
                    <span className="text-xs text-slate-400">
                      ID #{lead.id} • Added on {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {lead.company_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-300">
                    <User className="w-4 h-4 text-indigo-400" />
                    <span className="font-medium">{lead.contact_person}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title={isEditing ? 'Cancel Edit' : 'Edit Lead'}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete lead "${lead.company_name}"?`)) {
                        onDeleteLead(lead.id);
                        onClose();
                      }
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stage Progression Stepper */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
                  <span>Pipeline Stage: <strong className="text-white">{lead.stage}</strong></span>
                  <span>{lead.probability}% Win Probability</span>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {STAGES.map((s, idx) => {
                    const currentIdx = STAGES.findIndex(st => st.id === lead.stage);
                    const isPassed = idx <= currentIdx && lead.stage !== 'Closed Lost';
                    const isCurrent = s.id === lead.stage;

                    let bg = 'bg-slate-800 text-slate-400';
                    if (isCurrent) {
                      bg = s.id === 'Closed Won' ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400/50' :
                           s.id === 'Closed Lost' ? 'bg-rose-600 text-white font-bold' :
                           'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400/50';
                    } else if (isPassed) {
                      bg = 'bg-indigo-900/60 text-indigo-200 border border-indigo-500/30';
                    }

                    return (
                      <button
                        key={s.id}
                        onClick={() => handleStageChange(s.id)}
                        className={`py-1.5 px-1 rounded text-[10px] text-center transition-all truncate hover:opacity-90 ${bg}`}
                        title={`Move to ${s.label}`}
                      >
                        {s.id === 'Proposal Sent' ? 'Proposal' : s.label.replace('Closed ', '')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Communication Action Bar */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800/80">
                {lead.email && (
                  <button
                    onClick={() => onOpenEmailTemplate(lead)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate IT Proposal Email
                  </button>
                )}

                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    Call
                  </a>
                )}

                {lead.phone && (
                  <a
                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    WhatsApp
                  </a>
                )}

                {lead.website && (
                  <a
                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    Website
                  </a>
                )}
              </div>
            </div>

            {/* Drawer Body Content */}
            <div className="p-6 space-y-6 flex-1">

              {/* Edit Mode Form */}
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="text-sm font-semibold text-white">Edit Lead Details</h3>
                    <span className="text-xs text-slate-400">Save changes below</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Company Name</label>
                      <input
                        type="text"
                        value={editForm.company_name || ''}
                        onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Contact Person</label>
                      <input
                        type="text"
                        value={editForm.contact_person || ''}
                        onChange={(e) => setEditForm({ ...editForm, contact_person: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Phone</label>
                      <input
                        type="text"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">IT Service Interested In</label>
                      <select
                        value={editForm.service || ''}
                        onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                      >
                        {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Deal Value ({currency})</label>
                      <input
                        type="number"
                        value={editForm.deal_value || 0}
                        onChange={(e) => setEditForm({ ...editForm, deal_value: Number(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Priority</label>
                      <select
                        value={editForm.priority || 'Medium'}
                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                      >
                        {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Owner</label>
                      <select
                        value={editForm.owner || 'Alex Mercer'}
                        onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                      >
                        {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Location</label>
                      <input
                        type="text"
                        value={editForm.location || ''}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Website</label>
                      <input
                        type="text"
                        value={editForm.website || ''}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 text-xs">Technical Notes & Requirements</label>
                    <textarea
                      rows="3"
                      value={editForm.notes || ''}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Deal Overview Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Deal Value</span>
                  <span className="text-lg font-bold text-white flex items-center">
                    {FORMAT_CURRENCY(lead.deal_value, currency)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Win Probability</span>
                  <span className="text-lg font-bold text-indigo-400">
                    {lead.probability}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Lead Source</span>
                  <span className="text-sm font-semibold text-slate-200 truncate block">
                    {lead.source}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Account Owner</span>
                  <span className="text-sm font-semibold text-slate-200 truncate block">
                    {lead.owner}
                  </span>
                </div>
              </div>

              {/* IT Service & Contact Details Summary */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Service Scope</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                    {lead.service}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{lead.email || 'No email specified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{lead.phone || 'No phone specified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{lead.location || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{lead.website || 'No website'}</span>
                  </div>
                </div>

                {lead.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">Technical Notes:</span>
                    <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      {lead.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Follow-up Tasks Section */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    Follow-ups & Agenda
                  </h3>
                  <span className="text-xs text-slate-400">
                    {lead.tasks ? lead.tasks.filter(t => !t.completed).length : 0} pending
                  </span>
                </div>

                {/* Add new task input */}
                <form onSubmit={handleAddTask} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Send revised quote / Demo call..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <input
                    type="datetime-local"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={savingTask || !newTaskTitle || !newTaskDue}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shrink-0"
                  >
                    Add
                  </button>
                </form>

                {/* Tasks List */}
                <div className="space-y-2 mt-2">
                  {(!lead.tasks || lead.tasks.length === 0) ? (
                    <p className="text-xs text-slate-500 italic py-2 text-center">No tasks scheduled yet.</p>
                  ) : (
                    lead.tasks.map(t => {
                      const isPast = new Date(t.due_date) < new Date() && !t.completed;
                      return (
                        <div
                          key={t.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg text-xs border transition-colors ${
                            t.completed ? 'bg-slate-950/40 border-slate-800/40 text-slate-500 line-through' :
                            isPast ? 'bg-rose-950/20 border-rose-500/30 text-rose-300' :
                            'bg-slate-950 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={t.completed === 1}
                              onChange={() => handleToggleTask(t.id)}
                              className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                            />
                            <span className="truncate">{t.title}</span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-2">
                            <span className={`text-[11px] ${isPast ? 'font-bold text-rose-400' : 'text-slate-400'}`}>
                              {new Date(t.due_date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button
                              onClick={() => handleDeleteTask(t.id)}
                              className="text-slate-500 hover:text-rose-400 p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Activity History & Logging Section */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    Touchpoint History & Timeline
                  </h3>
                  <span className="text-xs text-slate-400">
                    {lead.activities ? lead.activities.length : 0} logged touches
                  </span>
                </div>

                {/* Quick Add Touch Form */}
                <form onSubmit={handleAddActivity} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Log Touch:</span>
                    {['Call', 'Meeting', 'Email', 'Proposal', 'Note'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setActType(type)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                          actType === type ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder={`Summary of ${actType} (e.g., Reviewed technical requirements with Sophia)...`}
                    value={actSummary}
                    onChange={(e) => setActSummary(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />

                  <textarea
                    rows="2"
                    placeholder="Additional details, next steps agreed upon..."
                    value={actDetails}
                    onChange={(e) => setActDetails(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingActivity || !actSummary.trim()}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs rounded shadow"
                    >
                      {savingActivity ? 'Saving...' : 'Log Touchpoint'}
                    </button>
                  </div>
                </form>

                {/* Timeline Stream */}
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {(!lead.activities || lead.activities.length === 0) ? (
                    <p className="text-xs text-slate-500 italic py-2">No activities recorded yet.</p>
                  ) : (
                    lead.activities.map(act => {
                      let dotColor = 'bg-slate-500';
                      if (act.type === 'Call') dotColor = 'bg-emerald-400';
                      else if (act.type === 'Meeting') dotColor = 'bg-purple-400';
                      else if (act.type === 'Proposal') dotColor = 'bg-amber-400';
                      else if (act.type === 'Stage Change') dotColor = 'bg-indigo-400';
                      else if (act.type === 'Email') dotColor = 'bg-cyan-400';

                      return (
                        <div key={act.id} className="relative group">
                          <span className={`absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-slate-950 ${dotColor}`} />
                          
                          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                                <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                                  {act.type}
                                </span>
                                {act.summary}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {new Date(act.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {act.details && (
                              <p className="text-xs text-slate-400 mt-1 whitespace-pre-wrap">
                                {act.details}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}
