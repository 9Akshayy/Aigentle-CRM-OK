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
  Briefcase
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
  setSelectedOwner
}) {
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

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
      onStageChange(Number(leadId), targetStageId);
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

  return (
    <div className="flex flex-col h-full">
      
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
        </div>

        {/* Total leads count in view */}
        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-white">{leads.length}</span> leads in pipeline
        </div>
      </div>

      {/* Kanban Stages Grid */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory select-none">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter(l => l.stage === stage.id);
          const stageTotalValue = stageLeads.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);
          const isOver = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`flex-shrink-0 w-[86vw] max-w-[320px] sm:w-80 rounded-2xl flex flex-col bg-slate-900/40 border snap-center transition-all ${
                isOver 
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
                    stage.id === 'Qualified' ? 'bg-cyan-400' :
                    stage.id === 'Contacted' ? 'bg-indigo-400' : 'bg-blue-400'
                  }`} />
                  <h3 className="font-semibold text-sm text-slate-200">
                    {stage.label}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
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
                    <p className="text-xs text-slate-500">No leads in this stage</p>
                    <p className="text-[10px] text-slate-600 mt-1">Drag and drop leads here</p>
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

                        {/* Stage quick jump buttons on hover */}
                        <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                          <select
                            onClick={(e) => e.stopPropagation()}
                            value={lead.stage}
                            onChange={(e) => {
                              e.stopPropagation();
                              onStageChange(lead.id, e.target.value);
                            }}
                            className="text-[10px] bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            {STAGES.map(s => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1 text-slate-400">
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
