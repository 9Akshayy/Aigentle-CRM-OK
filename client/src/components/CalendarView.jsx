import React, { useState, useMemo } from 'react';
import { 
  STAGES, 
  PRIORITIES, 
  SERVICES, 
  FORMAT_CURRENCY, 
  GET_WHATSAPP_LINK 
} from '../constants/crm';
import { 
  Calendar as CalendarIcon, 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MessageCircle, 
  Briefcase, 
  ExternalLink, 
  Plus, 
  Filter, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Layers,
  ArrowRight,
  Bell,
  PhoneMissed
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({
  leads,
  onLeadClick,
  onStageChange,
  currency,
  onOpenNewLead,
  onOpenReminder,
  onOpenCallNotReceived
}) {
  // Find the most recent date with leads to set intelligent default year & month
  const initialDate = useMemo(() => {
    if (!leads || leads.length === 0) return new Date();
    // Sort leads by created_at descending
    const validDates = leads
      .map(l => l.created_at ? new Date(l.created_at) : null)
      .filter(d => d && !isNaN(d.getTime()));
    if (validDates.length > 0) {
      validDates.sort((a, b) => b - a);
      return validDates[0];
    }
    return new Date();
  }, [leads]);

  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear() || 2026);
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth() || 10); // 0-indexed, 10 = Nov
  const [selectedDayString, setSelectedDayString] = useState(() => {
    // Format YYYY-MM-DD
    const y = initialDate.getFullYear();
    const m = String(initialDate.getMonth() + 1).padStart(2, '0');
    const d = String(initialDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  // View mode: 'month' (standard month grid) | 'year' (12-month annual overview)
  const [calendarMode, setCalendarMode] = useState('month');

  // Filter inside calendar view
  const [serviceFilter, setServiceFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');

  // Helper to extract YYYY-MM-DD from a lead's created_at or notes
  const getLeadDateKey = (lead) => {
    if (lead.created_at) {
      const d = new Date(lead.created_at);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
    }
    // Fallback: check notes for Captured: DD-MM-YYYY
    if (lead.notes) {
      const m = lead.notes.match(/Captured:\s*(\d{2})-(\d{2})-(\d{4})/i);
      if (m) {
        return `${m[3]}-${m[2]}-${m[1]}`;
      }
    }
    return null;
  };

  // Group all leads by YYYY-MM-DD
  const leadsByDate = useMemo(() => {
    const map = {};
    leads.forEach(lead => {
      // Apply filters if selected
      if (serviceFilter !== 'all' && lead.service !== serviceFilter) return;
      if (stageFilter !== 'all' && lead.stage !== stageFilter) return;

      const key = getLeadDateKey(lead);
      if (key) {
        if (!map[key]) map[key] = [];
        map[key].push(lead);
      }
    });
    return map;
  }, [leads, serviceFilter, stageFilter]);

  // Group leads by month for the current year
  const yearMonthlyStats = useMemo(() => {
    const monthsData = Array.from({ length: 12 }, (_, idx) => ({
      monthIndex: idx,
      name: MONTH_NAMES[idx],
      shortName: MONTH_SHORT[idx],
      count: 0,
      totalValue: 0,
      qualifiedCount: 0,
      datesWithLeads: new Set()
    }));

    leads.forEach(lead => {
      const dateKey = getLeadDateKey(lead);
      if (dateKey) {
        const [y, m, d] = dateKey.split('-').map(Number);
        if (y === currentYear && m >= 1 && m <= 12) {
          const mIdx = m - 1;
          monthsData[mIdx].count += 1;
          monthsData[mIdx].totalValue += (Number(lead.deal_value) || 0);
          if (lead.stage === 'Qualified' || lead.stage === 'Closed Won') {
            monthsData[mIdx].qualifiedCount += 1;
          }
          monthsData[mIdx].datesWithLeads.add(d);
        }
      }
    });

    return monthsData;
  }, [leads, currentYear]);

  // Calendar matrix calculation for the selected month and year
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const startWeekday = firstDayOfMonth.getDay(); // 0 is Sunday
    
    const days = [];
    
    // Fill leading empty days from previous month
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        dateKey: null
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${currentYear}-${monthStr}-${dayStr}`;
      const dayLeads = leadsByDate[dateKey] || [];
      const totalValue = dayLeads.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);

      days.push({
        dayNumber: day,
        isCurrentMonth: true,
        dateKey,
        leads: dayLeads,
        totalValue
      });
    }

    // Trailing days to complete the 7-column grid
    const totalSlots = Math.ceil(days.length / 7) * 7;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        dateKey: null
      });
    }

    return days;
  }, [currentYear, currentMonth, leadsByDate]);

  // Leads for the currently selected date
  const selectedDateLeads = leadsByDate[selectedDayString] || [];
  const selectedDateTotalValue = selectedDateLeads.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);

  // Format date display (e.g., "Monday, November 17, 2026")
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDayString) return '';
    const [y, m, d] = selectedDayString.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [selectedDayString]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setSelectedDayString(`${y}-${m}-${d}`);
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* Top Header & Calendar Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title & View Switcher */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Date-Wise Lead Calendar
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Annual & Monthly
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Track, inspect, and manage ad campaign leads date-wise across the entire year
            </p>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Mode Switcher: Month vs Year */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setCalendarMode('month')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                calendarMode === 'month'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setCalendarMode('year')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                calendarMode === 'year'
                  ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Year Overview ({currentYear})
            </button>
          </div>

          {/* Today Button */}
          <button
            onClick={handleJumpToToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Today
          </button>

          {/* Add New Lead Shortcut */}
          <button
            onClick={onOpenNewLead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Lead</span>
          </button>
        </div>
      </div>

      {/* Year & Month Selection Strip */}
      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3">
        
        {/* Year Dropdown & Prev/Next Year */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentYear(prev => prev - 1)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Previous Year"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="bg-slate-950 border border-slate-700 text-white font-bold text-sm rounded-lg px-3 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {[2024, 2025, 2026, 2027, 2028].map(yr => (
              <option key={yr} value={yr}>Year {yr}</option>
            ))}
          </select>

          <button
            onClick={() => setCurrentYear(prev => prev + 1)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Next Year"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Month Selector Pills (Clickable) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-xs">
          {MONTH_NAMES.map((name, idx) => {
            const isSelected = currentMonth === idx && calendarMode === 'month';
            const monthStat = yearMonthlyStats[idx];
            const hasLeads = monthStat && monthStat.count > 0;

            return (
              <button
                key={name}
                onClick={() => {
                  setCurrentMonth(idx);
                  setCalendarMode('month');
                }}
                className={`shrink-0 px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30 ring-1 ring-cyan-300'
                    : hasLeads
                      ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-900/80'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{MONTH_SHORT[idx]}</span>
                {hasLeads && (
                  <span className={`text-[9px] px-1 rounded-full font-bold ${
                    isSelected ? 'bg-slate-950 text-white' : 'bg-cyan-500/30 text-cyan-300'
                  }`}>
                    {monthStat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Toolbars */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none"
          >
            <option value="all">All Services</option>
            {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none"
          >
            <option value="all">All Stages</option>
            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* VIEW 1: 12-Month Year Overview Mode */}
      {calendarMode === 'year' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-cyan-400" />
              Annual Lead Overview for {currentYear}
            </h3>
            <span className="text-xs text-slate-400">
              Total Annual Leads: <strong className="text-white">{yearMonthlyStats.reduce((sum, m) => sum + m.count, 0)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {yearMonthlyStats.map((m) => {
              const hasLeads = m.count > 0;
              return (
                <div
                  key={m.name}
                  onClick={() => {
                    setCurrentMonth(m.monthIndex);
                    setCalendarMode('month');
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] flex flex-col justify-between ${
                    hasLeads
                      ? 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-400 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-white text-base">
                      {m.name} {currentYear}
                    </span>
                    {hasLeads && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {m.count} Leads
                      </span>
                    )}
                  </div>

                  {hasLeads ? (
                    <div className="space-y-2">
                      <div className="text-xs text-slate-300 flex items-center justify-between">
                        <span>Pipeline Value:</span>
                        <strong className="text-white text-sm">
                          {FORMAT_CURRENCY(m.totalValue, currency)}
                        </strong>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Active Days:</span>
                        <span className="text-cyan-300 font-semibold">{m.datesWithLeads.size} days</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-semibold">
                        <span>Open Month ➔</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-600">
                      No leads recorded in {m.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: Month Calendar Grid & Date-Wise Leads Panel */}
      {calendarMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start animate-in fade-in duration-300">
          
          {/* Calendar Grid (7 Columns on Large Screens) */}
          <div className="lg:col-span-7 xl:col-span-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl p-4 sm:p-5">
            
            {/* Month Header Banner */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-400">
                Month Total: <strong className="text-white">{yearMonthlyStats[currentMonth]?.count || 0} leads</strong> ({FORMAT_CURRENCY(yearMonthlyStats[currentMonth]?.totalValue || 0, currency)})
              </div>
            </div>

            {/* Weekday Labels (Sun - Sat) */}
            <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
              {WEEKDAYS.map(day => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarDays.map((cell, idx) => {
                if (!cell.isCurrentMonth) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[70px] sm:min-h-[85px] p-1.5 rounded-xl bg-slate-950/30 border border-slate-900/40 text-slate-600 text-xs flex flex-col justify-between"
                    >
                      <span>{cell.dayNumber}</span>
                    </div>
                  );
                }

                const hasLeads = cell.leads && cell.leads.length > 0;
                const isSelected = cell.dateKey === selectedDayString;

                let cellStyle = 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300';
                if (isSelected) {
                  cellStyle = 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20 text-white font-bold';
                } else if (hasLeads) {
                  cellStyle = 'bg-gradient-to-b from-slate-900/90 to-indigo-950/40 border-indigo-500/40 hover:border-cyan-400 hover:shadow-md hover:shadow-cyan-500/10 text-white';
                }

                return (
                  <div
                    key={cell.dateKey}
                    onClick={() => setSelectedDayString(cell.dateKey)}
                    className={`min-h-[75px] sm:min-h-[95px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${cellStyle}`}
                  >
                    {/* Top Row: Date Number & Count Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-cyan-300 font-bold' : hasLeads ? 'text-white' : 'text-slate-400'}`}>
                        {cell.dayNumber}
                      </span>
                      {hasLeads && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 shadow-sm">
                          {cell.leads.length}
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Day Value / Stage Dots */}
                    {hasLeads ? (
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-cyan-300 truncate">
                          {FORMAT_CURRENCY(cell.totalValue, currency)}
                        </div>
                        <div className="flex items-center gap-1 overflow-hidden">
                          {cell.leads.slice(0, 4).map((l, lIdx) => (
                            <span
                              key={lIdx}
                              className={`w-1.5 h-1.5 rounded-full ${
                                l.stage === 'Qualified' ? 'bg-cyan-400 ring-1 ring-cyan-200' :
                                l.stage === 'Closed Won' ? 'bg-emerald-400' :
                                'bg-indigo-400'
                              }`}
                              title={`${l.company_name} (${l.stage})`}
                            />
                          ))}
                          {cell.leads.length > 4 && (
                            <span className="text-[8px] text-slate-400">+{cell.leads.length - 4}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-600 italic">No leads</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>Qualified Deal</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span>New Lead</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Won Contract</span>
                </span>
              </div>
              <div className="text-slate-500">
                Click any day to manage its leads
              </div>
            </div>

          </div>

          {/* Date-Wise Leads Inspector & Management Panel */}
          <div className="lg:col-span-5 xl:col-span-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl p-4 sm:p-5 flex flex-col min-h-[500px]">
            
            {/* Date Details Header */}
            <div className="pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="uppercase tracking-wider font-semibold text-cyan-400 flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Selected Date View
                </span>
                <span>{selectedDayString}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {formattedSelectedDate}
              </h3>

              {/* Day Metrics */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-500 block uppercase">Leads Captured</span>
                  <span className="text-base font-extrabold text-white">
                    {selectedDateLeads.length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-500 block uppercase">Total Day Value</span>
                  <span className="text-base font-extrabold text-cyan-300">
                    {FORMAT_CURRENCY(selectedDateTotalValue, currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Date-wise Leads List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 max-h-[calc(100vh-360px)]">
              {selectedDateLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-xl my-4 text-slate-500">
                  <CalendarIcon className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-xs font-semibold text-slate-400">No leads on this date</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Select a date with a cyan badge (such as Nov 17, 18, 19, 20) or click "+ Add Lead" to record a lead.
                  </p>
                  <button
                    onClick={onOpenNewLead}
                    className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    + Add Lead For This Date
                  </button>
                </div>
              ) : (
                selectedDateLeads.map((lead) => {
                  const priorityConfig = PRIORITIES.find(p => p.id === lead.priority) || PRIORITIES[2];
                  const stageConfig = STAGES.find(s => s.id === lead.stage) || STAGES[0];

                  return (
                    <div
                      key={lead.id}
                      onClick={() => onLeadClick(lead)}
                      className="p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-cyan-500/50 shadow transition-all cursor-pointer group"
                    >
                      {/* Top: Company & Priority */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {lead.company_name}
                        </h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${priorityConfig.color}`}>
                          {lead.priority}
                        </span>
                      </div>

                      {/* Contact & Phone */}
                      <div className="flex items-center gap-2 text-xs text-slate-300 mb-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium truncate">{lead.contact_person}</span>
                        {lead.phone && (
                          <span className="text-slate-500 text-[11px] truncate">({lead.phone})</span>
                        )}
                      </div>

                      {/* Service & Value */}
                      <div className="flex items-center justify-between text-xs py-1.5 border-t border-slate-800/80 mb-2">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 max-w-[160px] truncate">
                          <Briefcase className="w-3 h-3 shrink-0" />
                          <span className="truncate">{lead.service}</span>
                        </span>
                        <span className="font-bold text-white">
                          {FORMAT_CURRENCY(lead.deal_value, currency)}
                        </span>
                      </div>

                      {/* Stage & Communication Actions */}
                      <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.stage}
                            onChange={(e) => onStageChange(lead.id, e.target.value)}
                            className="text-[10px] bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none"
                          >
                            {STAGES.map(s => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>

                          {lead.stage !== 'Qualified' && (
                            <button
                              type="button"
                              onClick={() => onStageChange(lead.id, 'Qualified')}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40 border border-cyan-500/30 transition-colors shadow-sm"
                              title="Quick Qualify"
                            >
                              ⚡ Qualify
                            </button>
                          )}

                          {lead.stage === 'Qualified' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              ✓ Qualified
                            </span>
                          )}
                        </div>

                        {/* Direct Communication Buttons */}
                        <div className="flex items-center gap-1 text-slate-400" onClick={(e) => e.stopPropagation()}>
                          {/* Send Client Reminder Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenReminder) onOpenReminder(lead);
                            }}
                            className="p-1 rounded hover:bg-slate-800 text-amber-400 hover:text-amber-300 transition-colors"
                            title={`Send Client Reminder to ${lead.contact_person}`}
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>

                          {lead.phone && (
                            <a
                              href={GET_WHATSAPP_LINK(lead.phone, `Hi ${lead.contact_person}, this is regarding your inquiry for ${lead.service} with Aigentle IT Services.`)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                              title={`WhatsApp ${lead.contact_person}`}
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            </a>
                          )}
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors"
                              title={`Call ${lead.contact_person}`}
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
                              className="p-1 rounded hover:bg-slate-800 text-rose-400 hover:text-rose-300 transition-colors"
                              title={`Call Not Received ➔ Follow-up for ${lead.contact_person}`}
                            >
                              <PhoneMissed className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
                              title={`Email ${lead.contact_person}`}
                            >
                              <Mail className="w-3.5 h-3.5" />
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

        </div>
      )}

    </div>
  );
}
