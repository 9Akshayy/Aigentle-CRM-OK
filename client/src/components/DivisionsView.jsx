import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MessageCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Briefcase, 
  DollarSign, 
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  Layers,
  Smartphone,
  Globe,
  Bot,
  Code2,
  Cloud,
  Bell,
  PhoneMissed
} from 'lucide-react';
import { 
  DIVISIONS, 
  FORMAT_CURRENCY, 
  GET_WHATSAPP_LINK 
} from '../constants/crm';

const DIVISION_ICONS = {
  'Mobile App Division': Smartphone,
  'Web Development Division': Globe,
  'AI & Automation Division': Bot,
  'Custom Software Division': Code2,
  'Cloud & DevOps Division': Cloud
};

export default function DivisionsView({
  leads,
  onLeadClick,
  onVerifyLead,
  onUpdateDivision,
  currency = 'INR',
  onOpenReminder,
  onOpenCallNotReceived
}) {
  const [filterMode, setFilterMode] = useState('verified'); // 'verified' | 'all'
  const [selectedDivisionTab, setSelectedDivisionTab] = useState('all'); // 'all' or specific division id
  const [divisionSearch, setDivisionSearch] = useState('');

  // Filter leads based on mode and search
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      // 1. Verification filter
      if (filterMode === 'verified' && !l.is_verified) {
        return false;
      }
      // 2. Division tab filter
      if (selectedDivisionTab !== 'all' && l.division !== selectedDivisionTab) {
        return false;
      }
      // 3. Search query
      if (divisionSearch.trim()) {
        const q = divisionSearch.toLowerCase();
        const matchesName = l.company_name?.toLowerCase().includes(q);
        const matchesContact = l.contact_person?.toLowerCase().includes(q);
        const matchesService = l.service?.toLowerCase().includes(q);
        const matchesNotes = l.notes?.toLowerCase().includes(q);
        if (!matchesName && !matchesContact && !matchesService && !matchesNotes) {
          return false;
        }
      }
      return true;
    });
  }, [leads, filterMode, selectedDivisionTab, divisionSearch]);

  // Total stats
  const totalVerifiedCount = useMemo(() => leads.filter(l => l.is_verified).length, [leads]);
  const totalVerifiedValue = useMemo(() => {
    return leads
      .filter(l => l.is_verified)
      .reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);
  }, [leads]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-20">
      
      {/* Header & Division Metrics Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                Division-Wise Architecture
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Verified Leads by Division</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                {totalVerifiedCount} Verified
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Organize verified prospect leads divided across specialized IT Engineering Divisions
            </p>
          </div>

          {/* Quick Filter Toggle: Verified Only vs All */}
          <div className="flex items-center gap-2 bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterMode('verified')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                filterMode === 'verified'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Leads ({totalVerifiedCount})</span>
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                filterMode === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Leads ({leads.length})</span>
            </button>
          </div>
        </div>

        {/* Division KPI Cards Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-4">
          {DIVISIONS.map((div) => {
            const Icon = DIVISION_ICONS[div.id] || Smartphone;
            const divLeads = leads.filter(l => l.division === div.id);
            const divVerifiedCount = divLeads.filter(l => l.is_verified).length;
            const divValue = divLeads.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);
            const isSelected = selectedDivisionTab === div.id;

            return (
              <button
                key={div.id}
                onClick={() => setSelectedDivisionTab(isSelected ? 'all' : div.id)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                  isSelected 
                    ? 'bg-slate-800/90 border-cyan-400 ring-2 ring-cyan-500/30' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/90'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`p-1.5 rounded-lg ${div.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {divVerifiedCount} ver.
                  </span>
                </div>
                <div className="font-bold text-xs text-white truncate">
                  {div.short}
                </div>
                <div className="text-[11px] font-semibold text-emerald-400 mt-0.5">
                  {FORMAT_CURRENCY(divValue, currency)}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {divLeads.length} total leads
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar: Search + Quick Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search leads inside divisions..."
            value={divisionSearch}
            onChange={(e) => setDivisionSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
          {divisionSearch && (
            <button onClick={() => setDivisionSearch('')} className="text-[10px] text-slate-400 hover:text-white">
              Clear
            </button>
          )}
        </div>

        {/* Division Tab Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setSelectedDivisionTab('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              selectedDivisionTab === 'all'
                ? 'bg-white text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            All Divisions ({filteredLeads.length})
          </button>
          {DIVISIONS.map(d => {
            const count = filteredLeads.filter(l => l.division === d.id).length;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDivisionTab(d.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1 ${
                  selectedDivisionTab === d.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                <span>{d.short}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Division-Wise Grid Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {DIVISIONS.filter(d => selectedDivisionTab === 'all' || selectedDivisionTab === d.id).map(div => {
          const divLeads = filteredLeads.filter(l => (l.division || 'Mobile App Division') === div.id);
          const Icon = DIVISION_ICONS[div.id] || Smartphone;
          const divTotalValue = divLeads.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);

          return (
            <div 
              key={div.id}
              className="rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col shadow-xl overflow-hidden"
            >
              {/* Division Column Header */}
              <div className="p-3.5 border-b border-slate-800/90 bg-slate-900/90 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1.5 rounded-lg ${div.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-white truncate">
                      {div.label}
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate">
                      {div.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className="text-xs font-bold text-emerald-400 block">
                    {FORMAT_CURRENCY(divTotalValue, currency)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {divLeads.length} lead{divLeads.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Division Lead Cards Stream */}
              <div className="p-3 space-y-2.5 max-h-[600px] overflow-y-auto touch-scroll">
                {divLeads.length === 0 ? (
                  <div className="py-10 px-4 text-center border-2 border-dashed border-slate-800/60 rounded-xl my-2">
                    <Icon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-400">
                      No leads in {div.short}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {filterMode === 'verified' 
                        ? 'Verify leads to route them here' 
                        : 'Assign leads to this division using the dropdown'}
                    </p>
                  </div>
                ) : (
                  divLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => onLeadClick(lead)}
                      className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800/80 hover:border-cyan-500/40 shadow transition-all cursor-pointer group"
                    >
                      {/* Top: Company & Verification Badge */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                            {lead.company_name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5">
                            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{lead.contact_person}</span>
                          </div>
                        </div>

                        {/* Verified Status Pill */}
                        <div onClick={(e) => e.stopPropagation()}>
                          {lead.is_verified ? (
                            <button
                              type="button"
                              onClick={() => onVerifyLead(lead.id, false, lead.division)}
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 transition-colors flex items-center gap-1 shrink-0"
                              title="Click to Revoke Verification"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Verified</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onVerifyLead(lead.id, true, div.id)}
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors flex items-center gap-1 shrink-0"
                              title="Click to Mark Lead as Verified"
                            >
                              <ShieldCheck className="w-3 h-3 text-cyan-400" />
                              <span>Mark Verified</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Service & Deal Value */}
                      <div className="flex items-center justify-between py-1.5 border-y border-slate-800/80 text-xs my-2">
                        <span className="text-[11px] text-indigo-300 truncate max-w-[180px]">
                          {lead.service}
                        </span>
                        <span className="font-bold text-white">
                          {FORMAT_CURRENCY(lead.deal_value, currency)}
                        </span>
                      </div>

                      {/* Division Reassign & Quick Actions */}
                      <div className="flex items-center justify-between gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                        {/* Division Switcher */}
                        <select
                          value={lead.division || div.id}
                          onChange={(e) => onUpdateDivision(lead.id, e.target.value)}
                          className="text-[10px] bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-slate-300 focus:outline-none max-w-[140px] truncate"
                          title="Change Division"
                        >
                          {DIVISIONS.map(d => (
                            <option key={d.id} value={d.id}>{d.short}</option>
                          ))}
                        </select>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                          {lead.phone && (
                            <a
                              href={GET_WHATSAPP_LINK(lead.phone, `Hi ${lead.contact_person}, this is regarding your inquiry for ${lead.service} with Aigentle IT Services.`)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400"
                              title="Call"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Reminder */}
                          <button
                            type="button"
                            onClick={() => onOpenReminder && onOpenReminder(lead)}
                            className="p-1 rounded hover:bg-slate-800 text-amber-400 hover:text-amber-300"
                            title="Send Client Reminder"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>

                          {/* Call Not Received */}
                          {lead.phone && (
                            <button
                              type="button"
                              onClick={() => onOpenCallNotReceived && onOpenCallNotReceived(lead)}
                              className="p-1 rounded hover:bg-slate-800 text-rose-400 hover:text-rose-300"
                              title="Call Not Received ➔ Follow-up"
                            >
                              <PhoneMissed className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
