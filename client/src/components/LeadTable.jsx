import React, { useState } from 'react';
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
  Sparkles
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
  initialStageFilter = 'all'
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkTargetStage, setBulkTargetStage] = useState('');
  const [tableStageFilter, setTableStageFilter] = useState(initialStageFilter || 'all');

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

  // 1. Filter by Stage if selected
  const filteredByStage = leads.filter(l => {
    if (tableStageFilter === 'all') return true;
    return l.stage === tableStageFilter;
  });

  // 2. Sort leads
  const sortedLeads = [...filteredByStage].sort((a, b) => {
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

          <div className="flex items-center gap-2">
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

            {tableStageFilter !== 'all' && (
              <button
                onClick={() => setTableStageFilter('all')}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
              >
                Clear Filter
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

      {/* Main Table Container */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-xl">
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
                  <td colSpan="10" className="py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">No leads found in stage "{tableStageFilter}".</p>
                    {tableStageFilter !== 'all' && (
                      <button
                        onClick={() => setTableStageFilter('all')}
                        className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 underline"
                      >
                        View all {leads.length} leads
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

                      {/* Owner */}
                      <td className="py-3 px-4 text-slate-300">
                        {lead.owner}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
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
    </div>
  );
}
