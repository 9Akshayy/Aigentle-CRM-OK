import React, { useState, useMemo } from 'react';
import { 
  STAGES, 
  PRIORITIES, 
  SERVICES, 
  OWNERS, 
  FORMAT_CURRENCY, 
  GET_WHATSAPP_LINK 
} from '../constants/crm';
import { 
  User, 
  Building2, 
  Clock, 
  Trash2, 
  Edit3, 
  Phone, 
  Mail, 
  MessageCircle, 
  ExternalLink, 
  ChevronUp, 
  ChevronDown, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  Briefcase, 
  Filter, 
  Layers, 
  Sparkles,
  Calendar,
  Bell,
  PhoneMissed
} from 'lucide-react';

export default function LeadTable({
  leads,
  onLeadClick,
  onStageChange,
  onDeleteLead,
  onBulkDelete,
  onBulkStageChange,
  currency,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  initialStageFilter = 'all',
  onOpenReminder,
  onOpenCallNotReceived
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkTargetStage, setBulkTargetStage] = useState('');
  const [tableStageFilter, setTableStageFilter] = useState(initialStageFilter || 'all');
  const [tableDateFilter, setTableDateFilter] = useState('all');

  // Extract unique dates with lead counts
  const availableDates = useMemo(() => {
    const map = {};
    leads.forEach(l => {
      let dKey = null;
      if (l.created_at) {
        const d = new Date(l.created_at);
        if (!isNaN(d.getTime())) {
          dKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
      }
      if (dKey) {
        map[dKey] = (map[dKey] || 0) + 1;
      }
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [leads]);

  const toggleSelectAll = (filteredLeads) => {
    if (selectedIds.length === filteredLeads.length && filteredLeads.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id, e) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkStage = () => {
    if (!bulkTargetStage || selectedIds.length === 0) return;
    onBulkStageChange(selectedIds, bulkTargetStage);
    setSelectedIds([]);
    setBulkTargetStage('');
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} leads?`)) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 1. Filter by Stage and Date
  const filteredLeads = leads.filter(l => {
    if (tableStageFilter !== 'all' && l.stage !== tableStageFilter) return false;
    if (tableDateFilter !== 'all') {
      let dKey = null;
      if (l.created_at) {
        const d = new Date(l.created_at);
        if (!isNaN(d.getTime())) {
          dKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
      }
      if (dKey !== tableDateFilter) return false;
    }
    return true;
  });

  // 2. Sort leads
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'deal_value' || sortField === 'probability') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    } else {
      aVal = (aVal || '').toString().toLowerCase();
      bVal = (bVal || '').toString().toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="flex flex-col gap-3">
      
      {/* Stage Navigation & Filter Toolbar */}
      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Filter by Pipeline Stage:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Stage Filter */}
            <select
              value={tableStageFilter}
              onChange={(e) => setTableStageFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium"
            >
              <option value="all">All Stages ({leads.length})</option>
              {STAGES.map(s => {
                const count = leads.filter(l => l.stage === s.id).length;
                return (
                  <option key={s.id} value={s.id}>
                    {s.label} ({count})
                  </option>
                );
              })}
            </select>

            {/* Date-Wise Filter */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={tableDateFilter}
                onChange={(e) => setTableDateFilter(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium"
              >
                <option value="all">All Dates ({leads.length})</option>
                {availableDates.map(([dKey, cnt]) => {
                  const [y, m, d] = dKey.split('-');
                  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  return (
                    <option key={dKey} value={dKey}>
                      {d} {monthNames[Number(m)-1]} {y} ({cnt} leads)
                    </option>
                  );
                })}
              </select>
            </div>

            {(tableStageFilter !== 'all' || tableDateFilter !== 'all') && (
              <button
                onClick={() => {
                  setTableStageFilter('all');
                  setTableDateFilter('all');
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium ml-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Stage Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setTableStageFilter('all')}
            className={`shrink-0 px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              tableStageFilter === 'all'
                ? 'bg-white text-slate-950 font-bold shadow-md'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
            }`}
          >
            <span>All Stages</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              tableStageFilter === 'all' ? 'bg-slate-950 text-white' : 'bg-slate-900 text-slate-400'
            }`}>
              {leads.length}
            </span>
          </button>

          {STAGES.map((s) => {
            const count = leads.filter(l => l.stage === s.id).length;
            const isSelected = tableStageFilter === s.id;

            let activePillStyle = 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400/50 shadow-md';
            if (s.id === 'Qualified') activePillStyle = 'bg-cyan-500 text-slate-950 font-bold ring-2 ring-cyan-300 shadow-md shadow-cyan-500/30';
            else if (s.id === 'Closed Won') activePillStyle = 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400 shadow-md shadow-emerald-500/30';
            else if (s.id === 'Closed Lost') activePillStyle = 'bg-rose-600 text-white font-bold ring-2 ring-rose-400';
            else if (s.id === 'Proposal Sent') activePillStyle = 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-300';
            else if (s.id === 'Negotiation') activePillStyle = 'bg-purple-600 text-white font-bold ring-2 ring-purple-400';

            return (
              <button
                key={s.id}
                onClick={() => setTableStageFilter(s.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? activePillStyle
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  s.id === 'Qualified' ? 'bg-cyan-400' :
                  s.id === 'Closed Won' ? 'bg-emerald-400' :
                  s.id === 'Proposal Sent' ? 'bg-amber-400' :
                  s.id === 'Closed Lost' ? 'bg-rose-400' :
                  s.id === 'Negotiation' ? 'bg-purple-400' :
                  s.id === 'Contacted' ? 'bg-indigo-400' : 'bg-blue-400'
                }`} />
                <span>{s.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-slate-950/20 text-current' : count > 0 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-900 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-indigo-300">
              {selectedIds.length} lead{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-slate-200 underline"
            >
              Deselect All
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-300">Move to:</span>
            <select
              value={bulkTargetStage}
              onChange={(e) => setBulkTargetStage(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1"
            >
              <option value="">Select Stage...</option>
              {STAGES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={handleBulkStage}
              disabled={!bulkTargetStage}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg"
            >
              Apply
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-1 bg-rose-600/80 hover:bg-rose-600 text-white font-medium rounded-lg ml-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container (Desktop / Tablet) */}
      <div className="hidden md:block rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-10 text-center">
                  <button onClick={() => toggleSelectAll(sortedLeads)} className="text-slate-400 hover:text-slate-200">
                    {selectedIds.length === sortedLeads.length && sortedLeads.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th onClick={() => handleSort('company_name')} className="py-3 px-4 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">
                    Company
                    {sortField === 'company_name' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th onClick={() => handleSort('contact_person')} className="py-3 px-4 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">
                    Contact
                    {sortField === 'contact_person' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th onClick={() => handleSort('service')} className="py-3 px-4 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">
                    IT Service
                    {sortField === 'service' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th onClick={() => handleSort('deal_value')} className="py-3 px-4 cursor-pointer hover:text-white text-right">
                  <div className="flex items-center justify-end gap-1">
                    Deal Value
                    {sortField === 'deal_value' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th onClick={() => handleSort('stage')} className="py-3 px-4 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">
                    Stage
                    {sortField === 'stage' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th onClick={() => handleSort('priority')} className="py-3 px-4 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">
                    Priority
                    {sortField === 'priority' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th onClick={() => handleSort('next_followup')} className="py-3 px-4 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">
                    Next Follow-up
                    {sortField === 'next_followup' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th onClick={() => handleSort('created_at')} className="py-3 px-4 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">
                    Captured Date
                    {sortField === 'created_at' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th onClick={() => handleSort('owner')} className="py-3 px-4 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">
                    Owner
                    {sortField === 'owner' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {sortedLeads.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">No leads match your selected stage or date filters.</p>
                    {(tableStageFilter !== 'all' || tableDateFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setTableStageFilter('all');
                          setTableDateFilter('all');
                        }}
                        className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 underline"
                      >
                        Reset filters to view all {leads.length} leads
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                sortedLeads.map((lead) => {
                  const isSelected = selectedIds.includes(lead.id);
                  const stageConfig = STAGES.find(s => s.id === lead.stage) || STAGES[0];
                  const priorityConfig = PRIORITIES.find(p => p.id === lead.priority) || PRIORITIES[2];
                  
                  const followupDate = lead.next_followup ? new Date(lead.next_followup) : null;
                  const isOverdue = followupDate && followupDate < new Date();
                  const isToday = followupDate && followupDate.toDateString() === new Date().toDateString();

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onLeadClick(lead)}
                      className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-950/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center" onClick={(e) => toggleSelectLead(lead.id, e)}>
                        <button className="text-slate-400 hover:text-indigo-400">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Company Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white group-hover:text-indigo-300">
                          {lead.company_name}
                        </div>
                        {lead.location && (
                          <div className="text-[11px] text-slate-500">{lead.location}</div>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <div className="text-slate-200 font-medium">{lead.contact_person}</div>
                        <div className="text-[11px] text-slate-500">{lead.email || lead.phone}</div>
                      </td>

                      {/* IT Service */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 max-w-[200px] truncate">
                          <Briefcase className="w-3 h-3 shrink-0" />
                          <span className="truncate">{lead.service}</span>
                        </span>
                      </td>

                      {/* Deal Value */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-white">
                          {FORMAT_CURRENCY(lead.deal_value, currency)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {lead.probability}% Prob
                        </div>
                      </td>

                      {/* Stage Dropdown & 1-Click Qualify */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <select
                            value={lead.stage}
                            onChange={(e) => onStageChange(lead.id, e.target.value)}
                            className={`text-xs rounded-lg px-2 py-1 font-semibold border bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${stageConfig.badgeColor}`}
                          >
                            {STAGES.map(s => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>

                          {(lead.stage === 'New' || lead.stage === 'Contacted') && (
                            <button
                              type="button"
                              onClick={() => onStageChange(lead.id, 'Qualified')}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40 border border-cyan-500/40 transition-colors shadow-sm"
                              title="Quick Qualify Lead"
                            >
                              ⚡ Qualify
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${priorityConfig.color}`}>
                          {lead.priority}
                        </span>
                      </td>

                      {/* Next Follow-up */}
                      <td className="py-3 px-4">
                        {followupDate ? (
                          <div className={`flex items-center gap-1 text-[11px] font-medium ${
                            isOverdue ? 'text-rose-400 font-bold' : isToday ? 'text-amber-400 font-bold' : 'text-slate-400'
                          }`}>
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>
                              {followupDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              {isOverdue && ' (Overdue)'}
                              {isToday && ' (Today)'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Captured Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-300 font-medium text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>
                            {lead.created_at ? new Date(lead.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="py-3 px-4 text-slate-300">
                        {lead.owner}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Send Client Reminder Button */}
                          <button
                            onClick={() => {
                              if (onOpenReminder) onOpenReminder(lead);
                            }}
                            className="p-1 rounded hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
                            title={`Send Client Reminder to ${lead.contact_person}`}
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>

                          {lead.phone && (
                            <a
                              href={GET_WHATSAPP_LINK(lead.phone, `Hi ${lead.contact_person}, this is regarding your inquiry for ${lead.service} with Aigentle IT Services.`)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-emerald-400"
                              title={`WhatsApp ${lead.contact_person}`}
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            </a>
                          )}
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-blue-400"
                              title={`Call ${lead.phone}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {lead.phone && (
                            <button
                              onClick={() => {
                                if (onOpenCallNotReceived) onOpenCallNotReceived(lead);
                              }}
                              className="p-1 rounded hover:bg-slate-700 text-rose-400 hover:text-rose-300 transition-colors"
                              title="Call Not Received ➔ Move to Follow-up"
                            >
                              <PhoneMissed className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-indigo-400"
                              title={`Email ${lead.email}`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => onLeadClick(lead)}
                            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                            title="View Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete lead "${lead.company_name}"?`)) {
                                onDeleteLead(lead.id);
                              }
                            }}
                            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-rose-400"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List (Optimized for Android & iPhone) */}
      <div className="md:hidden space-y-3 pb-6">
        {sortedLeads.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
            <p className="text-xs font-medium">No leads match your selected filters.</p>
          </div>
        ) : (
          sortedLeads.map((lead) => {
            const isSelected = selectedIds.includes(lead.id);
            const stageConfig = STAGES.find(s => s.id === lead.stage) || STAGES[0];
            const priorityConfig = PRIORITIES.find(p => p.id === lead.priority) || PRIORITIES[2];

            return (
              <div
                key={lead.id}
                onClick={() => onLeadClick(lead)}
                className={`p-3.5 rounded-xl border bg-slate-900/80 shadow-md transition-all active:scale-[0.99] ${
                  isSelected ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-800'
                }`}
              >
                {/* Header: Checkbox + Company + Priority */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => toggleSelectLead(lead.id, e)}
                      className="text-slate-400 hover:text-indigo-400 p-0.5"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <h4 className="font-bold text-sm text-white line-clamp-1">
                        {lead.company_name}
                      </h4>
                      <p className="text-xs text-slate-400">{lead.contact_person}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${priorityConfig.color}`}>
                    {lead.priority}
                  </span>
                </div>

                {/* Service Tag & Value */}
                <div className="flex items-center justify-between py-1.5 border-y border-slate-800/80 my-2 text-xs">
                  <span className="text-[11px] font-medium text-indigo-300 truncate max-w-[180px]">
                    {lead.service}
                  </span>
                  <span className="font-bold text-white">
                    {FORMAT_CURRENCY(lead.deal_value, currency)}
                  </span>
                </div>

                {/* Footer Actions on Mobile */}
                <div className="flex items-center justify-between gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                  {/* Stage Dropdown */}
                  <select
                    value={lead.stage}
                    onChange={(e) => onStageChange(lead.id, e.target.value)}
                    className="text-[11px] bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
                  >
                    {STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Send Reminder */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenReminder) onOpenReminder(lead);
                      }}
                      className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1"
                      title="Send Client Reminder"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px]">Reminder</span>
                    </button>

                    {lead.phone && (
                      <a
                        href={GET_WHATSAPP_LINK(lead.phone, `Hi ${lead.contact_person}, this is regarding your inquiry for ${lead.service} with Aigentle IT Services.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="p-1.5 rounded-lg bg-slate-800 text-blue-400 border border-slate-700"
                        title="Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {lead.phone && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenCallNotReceived) onOpenCallNotReceived(lead);
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1"
                        title="Call Not Received ➔ Follow-up"
                      >
                        <PhoneMissed className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-[10px]">Missed</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
