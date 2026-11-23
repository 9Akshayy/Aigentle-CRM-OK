import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  STAGES, 
  PRIORITIES, 
  SERVICES, 
  OWNERS, 
  FORMAT_CURRENCY,
  GET_WHATSAPP_LINK 
} from '../constants/crm';
import { 
  Building2, 
  User, 
  Calendar, 
  Clock, 
  DollarSign, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  MessageCircle,
  ArrowRight,
  Filter,
  CheckCircle2,
  XCircle,
  Briefcase,
  Sparkles,
  Zap,
  Eye,
  Layers,
  ChevronRight,
  ChevronLeft,
  Bell
} from 'lucide-react';

export default function KanbanBoard({
  leads,
  onLeadClick,
  onStageChange,
  currency,
  selectedService,
  setSelectedService,
  selectedPriority,
  setSelectedPriority,
  selectedOwner,
  setSelectedOwner,
  initialStageFilter = 'all',
  onOpenReminder
}) {
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // Active stage navigation / filter
  const [activeStageFilter, setActiveStageFilter] = useState(initialStageFilter || 'all');
  const [viewMode, setViewMode] = useState('all'); // 'all' (horizontal board) | 'single' (focused column)
  const [highlightedStage, setHighlightedStage] = useState(null);
  const [kanbanDateFilter, setKanbanDateFilter] = useState('all');

  // Extract unique dates with counts
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

  // Filter leads by date if active
  const filteredLeadsByDate = useMemo(() => {
    if (kanbanDateFilter === 'all') return leads;
    return leads.filter(l => {
      let dKey = null;
      if (l.created_at) {
        const d = new Date(l.created_at);
        if (!isNaN(d.getTime())) {
          dKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
      }
      return dKey === kanbanDateFilter;
    });
  }, [leads, kanbanDateFilter]);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const boardContainerRef = useRef(null);

  useEffect(() => {
    if (initialStageFilter && initialStageFilter !== 'all') {
      scrollToStage(initialStageFilter);
    }
  }, [initialStageFilter]);

  // Smooth scroll to a stage column
  const scrollToStage = (stageId) => {
    setActiveStageFilter(stageId);
    setHighlightedStage(stageId);

    if (stageId === 'all') {
      if (boardContainerRef.current) {
        boardContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
      return;
    }

    const colId = `kanban-col-${stageId.replace(/\s+/g, '-').toLowerCase()}`;
    const el = document.getElementById(colId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    setTimeout(() => {
      setHighlightedStage(null);
    }, 2800);
  };

  const triggerToast = (lead, newStage) => {
    setToast({
      message: `"${lead.company_name}" moved to ${newStage}!`,
      stageId: newStage
    });
    setTimeout(() => {
      setToast(null);
    }, 6000);
  };

  // Drag & drop handlers
  const handleDragStart = (e, leadId) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStageId) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      const movedLead = leads.find(l => l.id === Number(leadId));
      onStageChange(Number(leadId), targetStageId);
      if (movedLead) {
        triggerToast(movedLead, targetStageId);
      }
    }
    setDraggedLeadId(null);
  };

  const formatFollowup = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isPast = date < now;
    const isToday = date.toDateString() === now.toDateString();

    const formatted = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return {
      text: isToday ? `Today (${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : formatted,
      isPast,
      isToday
    };
  };

  // Determine which stages to display based on viewMode
  const stagesToRender = (viewMode === 'single' && activeStageFilter !== 'all')
    ? STAGES.filter(s => s.id === activeStageFilter)
    : STAGES;

  const currentStageIndex = STAGES.findIndex(s => s.id === activeStageFilter);

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-500/50 text-white text-xs flex items-center justify-between shadow-2xl shadow-cyan-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-semibold text-cyan-200">Stage Updated:</span>
            <span>{toast.message}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollToStage(toast.stageId)}
              className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all shadow"
            >
              Jump to {toast.stageId} Column ➔
            </button>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Stage Quick-Jump & Navigation Tabs (Mobile & Desktop) */}
      <div className="mb-3 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Pipeline Stage Jump:
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => {
                setViewMode('all');
                setActiveStageFilter('all');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-800/50'
              }`}
            >
              All Columns
            </button>
            <button
              onClick={() => {
                const target = activeStageFilter === 'all' ? 'Qualified' : activeStageFilter;
                setViewMode('single');
                setActiveStageFilter(target);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'single'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-800/50'
              }`}
              title="Show only the active column full-width (Best for phones)"
            >
              Focus Column
            </button>
          </div>
        </div>

        {/* Stage Pills Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => {
              setActiveStageFilter('all');
              scrollToStage('all');
            }}
            className={`shrink-0 px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              activeStageFilter === 'all'
                ? 'bg-white text-slate-950 font-bold shadow-md'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
            }`}
          >
            <span>All Stages</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeStageFilter === 'all' ? 'bg-slate-950 text-white' : 'bg-slate-900 text-slate-400'
            }`}>
              {leads.length}
            </span>
          </button>

          {STAGES.map((s) => {
            const count = leads.filter(l => l.stage === s.id).length;
            const isSelected = activeStageFilter === s.id;

            let activePillStyle = 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400/50 shadow-md';
            if (s.id === 'Qualified') activePillStyle = 'bg-cyan-500 text-slate-950 font-bold ring-2 ring-cyan-300 shadow-md shadow-cyan-500/30';
            else if (s.id === 'Closed Won') activePillStyle = 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400 shadow-md shadow-emerald-500/30';
            else if (s.id === 'Closed Lost') activePillStyle = 'bg-rose-600 text-white font-bold ring-2 ring-rose-400';
            else if (s.id === 'Proposal Sent') activePillStyle = 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-300';
            else if (s.id === 'Negotiation') activePillStyle = 'bg-purple-600 text-white font-bold ring-2 ring-purple-400';

            return (
              <button
                key={s.id}
                onClick={() => scrollToStage(s.id)}
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

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Service Filter */}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All IT Services</option>
            {SERVICES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>

          {/* Owner Filter */}
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Account Owners</option>
            {OWNERS.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          {/* Date Filter */}
          <div className="flex items-center gap-1 pl-1.5 border-l border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={kanbanDateFilter}
              onChange={(e) => setKanbanDateFilter(e.target.value)}
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
        </div>

        {/* Mode indicator & Total leads count */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {viewMode === 'single' && (
            <div className="flex items-center gap-1 text-cyan-300 font-semibold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              <Eye className="w-3.5 h-3.5" />
              <span>Focusing: {activeStageFilter}</span>
            </div>
          )}
          {kanbanDateFilter !== 'all' && (
            <button
              onClick={() => setKanbanDateFilter('all')}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
            >
              Clear Date Filter
            </button>
          )}
          <div>
            Showing <span className="font-semibold text-white">{filteredLeadsByDate.length}</span> leads in pipeline
          </div>
        </div>
      </div>

      {/* Focus Mode Navigation Bar (if single stage view) */}
      {viewMode === 'single' && activeStageFilter !== 'all' && (
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl mb-3 text-xs">
          <button
            onClick={() => {
              const prevIdx = (currentStageIndex - 1 + STAGES.length) % STAGES.length;
              scrollToStage(STAGES[prevIdx].id);
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev Stage</span>
          </button>

          <span className="font-bold text-white text-sm">
            {activeStageFilter} ({leads.filter(l => l.stage === activeStageFilter).length} leads)
          </span>

          <button
            onClick={() => {
              const nextIdx = (currentStageIndex + 1) % STAGES.length;
              scrollToStage(STAGES[nextIdx].id);
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-white"
          >
            <span>Next Stage</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Kanban Stages Grid */}
      <div 
        ref={boardContainerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory select-none touch-scroll"
      >
        {stagesToRender.map((stage) => {
          const stageLeads = filteredLeadsByDate.filter(l => l.stage === stage.id);
          const stageTotalValue = stageLeads.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);
          const isOver = dragOverStage === stage.id;
          const isHighlighted = highlightedStage === stage.id;

          const colId = `kanban-col-${stage.id.replace(/\s+/g, '-').toLowerCase()}`;

          return (
            <div
              key={stage.id}
              id={colId}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`flex-shrink-0 ${
                viewMode === 'single' ? 'w-full max-w-2xl mx-auto' : 'w-[86vw] max-w-[320px] sm:w-80'
              } rounded-2xl flex flex-col bg-slate-900/40 border snap-center transition-all duration-300 ${
                isHighlighted
                  ? 'border-cyan-400 ring-4 ring-cyan-500/40 bg-slate-900/90 shadow-2xl shadow-cyan-500/20'
                  : isOver 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-slate-900/80' 
                    : 'border-slate-800/80'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    stage.id === 'Closed Won' ? 'bg-emerald-400 shadow-sm shadow-emerald-400' :
                    stage.id === 'Closed Lost' ? 'bg-rose-400' :
                    stage.id === 'Proposal Sent' ? 'bg-amber-400' :
                    stage.id === 'Negotiation' ? 'bg-purple-400' :
                    stage.id === 'Qualified' ? 'bg-cyan-400 shadow-sm shadow-cyan-400' :
                    stage.id === 'Contacted' ? 'bg-indigo-400' : 'bg-blue-400'
                  }`} />
                  <h3 className="font-semibold text-sm text-slate-200">
                    {stage.label}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    stage.id === 'Qualified' && stageLeads.length > 0
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {stageLeads.length}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-300">
                  {FORMAT_CURRENCY(stageTotalValue, currency)}
                </div>
              </div>

              {/* Lead Cards List */}
              <div className="p-2.5 flex-1 flex flex-col gap-2.5 min-h-[480px] overflow-y-auto max-h-[calc(100vh-280px)]">
                {stageLeads.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-800/60 rounded-xl my-2">
                    <p className="text-xs font-medium text-slate-400">
                      No leads in {stage.label} stage
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
                      {stage.id === 'Qualified' 
                        ? 'Click "⚡ Qualify" on any New lead to move it here'
                        : 'Drag and drop cards or use the stage menu below'}
                    </p>
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const followup = formatFollowup(lead.next_followup);
                    const priorityConfig = PRIORITIES.find(p => p.id === lead.priority) || PRIORITIES[2];

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => onLeadClick(lead)}
                        className={`group relative p-3.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 shadow-md transition-all cursor-pointer hover:shadow-indigo-500/10 hover:-translate-y-0.5 active:cursor-grabbing ${
                          draggedLeadId === lead.id ? 'opacity-40 scale-95' : ''
                        }`}
                      >
                        {/* Company & Priority */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                            {lead.company_name}
                          </h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${priorityConfig.color}`}>
                            {lead.priority}
                          </span>
                        </div>

                        {/* Contact Person */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-2">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{lead.contact_person}</span>
                        </div>

                        {/* Service Tag */}
                        <div className="mb-2.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 max-w-full truncate">
                            <Briefcase className="w-3 h-3 shrink-0" />
                            <span className="truncate">{lead.service}</span>
                          </span>
                        </div>

                        {/* Deal Value & Win Probability */}
                        <div className="flex items-center justify-between py-1.5 border-t border-slate-700/50 text-xs">
                          <span className="font-bold text-slate-100 flex items-center">
                            {FORMAT_CURRENCY(lead.deal_value, currency)}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {lead.probability}% Prob
                          </span>
                        </div>

                        {/* Date Captured */}
                        {lead.created_at && (
                          <div className="flex items-center gap-1.5 py-1 text-[10px] text-slate-400 border-t border-slate-700/40">
                            <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span>Captured: {new Date(lead.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        )}

                        {/* Footer: Follow-up & Owner */}
                        <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                          {followup ? (
                            <span className={`flex items-center gap-1 font-medium ${
                              followup.isPast ? 'text-rose-400 animate-pulse' :
                              followup.isToday ? 'text-amber-400' : 'text-slate-400'
                            }`}>
                              <Clock className="w-3 h-3" />
                              {followup.text}
                            </span>
                          ) : (
                            <span className="text-slate-500">No follow-up set</span>
                          )}

                          <span className="truncate max-w-[100px] text-slate-400 text-right">
                            {lead.owner.split(' ')[0]}
                          </span>
                        </div>

                        {/* Stage quick jump buttons & One-Click Qualify */}
                        <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-1.5">
                            <select
                              onClick={(e) => e.stopPropagation()}
                              value={lead.stage}
                              onChange={(e) => {
                                e.stopPropagation();
                                const newStage = e.target.value;
                                onStageChange(lead.id, newStage);
                                triggerToast(lead, newStage);
                              }}
                              className="text-[10px] bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              {STAGES.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                              ))}
                            </select>

                            {/* Direct 1-Click Qualify Button */}
                            {(lead.stage === 'New' || lead.stage === 'Contacted') && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStageChange(lead.id, 'Qualified');
                                  triggerToast(lead, 'Qualified');
                                }}
                                className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40 border border-cyan-500/40 transition-colors shadow-sm flex items-center gap-1"
                                title="One-Click Qualify Lead"
                              >
                                <span>⚡ Qualify</span>
                              </button>
                            )}

                            {lead.stage === 'Qualified' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                ✓ Qualified
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-slate-400">
                            {/* Send Client Reminder */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onOpenReminder) onOpenReminder(lead);
                              }}
                              className="p-1 hover:text-amber-300 hover:bg-slate-700/80 rounded transition-colors text-amber-400/90"
                              title={`Send Client Reminder to ${lead.contact_person}`}
                            >
                              <Bell className="w-3.5 h-3.5" />
                            </button>

                            {lead.phone && (
                              <a
                                href={GET_WHATSAPP_LINK(lead.phone, `Hi ${lead.contact_person}, this is regarding your inquiry for ${lead.service} with Aigentle IT Services.`)}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 hover:text-emerald-400 hover:bg-slate-700 rounded transition-colors"
                                title={`WhatsApp ${lead.contact_person}`}
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                              </a>
                            )}
                            {lead.phone && (
                              <a
                                href={`tel:${lead.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 hover:text-blue-400 hover:bg-slate-700 rounded transition-colors"
                                title={`Call ${lead.contact_person}`}
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                            )}
                            {lead.email && (
                              <a
                                href={`mailto:${lead.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 hover:text-indigo-400 hover:bg-slate-700 rounded transition-colors"
                                title={`Email ${lead.contact_person}`}
                              >
                                <Mail className="w-3 h-3" />
                              </a>
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
        })}
      </div>
    </div>
  );
}
