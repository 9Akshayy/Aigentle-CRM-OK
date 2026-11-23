import React, { useState } from 'react';
import { 
  Columns3, 
  Table, 
  Calendar,
  BarChart3, 
  CalendarClock, 
  FileText, 
  Plus, 
  Search, 
  Download, 
  RotateCcw,
  Sparkles,
  Bot,
  Trash2,
  MoreVertical,
  Bell,
  ShieldCheck
} from 'lucide-react';
import { CURRENCY_SYMBOLS } from '../constants/crm';

export default function Navbar({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  currency,
  setCurrency,
  onOpenNewLead,
  onOpenImportExport,
  onResetSeed,
  onClearAll,
  overdueTasksCount = 0
}) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md safe-area-pt">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1">
                  Aigentle <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">CRM</span>
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  IT Services
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Intelligent Lead Pipeline & Deal Tracker</p>
            </div>
          </div>

          {/* Desktop Search Box */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search companies, contacts, services, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300 bg-slate-800 rounded px-1.5 py-0.5"
              >
                Clear
              </button>
            )}
          </div>

          {/* Nav Views Switcher (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setCurrentView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Kanban Pipeline Board"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Pipeline</span>
            </button>

            <button
              onClick={() => setCurrentView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Leads Table List"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Leads Table</span>
            </button>

            <button
              onClick={() => setCurrentView('divisions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'divisions'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Verified Leads Divided by Division"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Divisions</span>
            </button>

            <button
              onClick={() => setCurrentView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Date-Wise & Annual Calendar View"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Calendar</span>
            </button>

            <button
              onClick={() => setCurrentView('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Pipeline Analytics & Win Rates"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Analytics</span>
            </button>

            <button
              onClick={() => setCurrentView('tasks')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Follow-ups and Call Reminders"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Follow-ups</span>
              {overdueTasksCount > 0 && (
                <span className="flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {overdueTasksCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('templates')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'templates'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="IT Proposal & Email Generator"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Proposals</span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Currency Selector */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs text-slate-300">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-2 py-1 rounded font-semibold transition-colors ${
                  currency === 'INR' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-white'
                }`}
                title="Indian Rupees (₹)"
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`hidden sm:inline px-2 py-1 rounded font-medium transition-colors ${
                  currency === 'USD' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-white'
                }`}
                title="US Dollars ($)"
              >
                $
              </button>
            </div>

            {/* Excel / CSV Import & Export */}
            <button
              onClick={onOpenImportExport}
              className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center gap-1"
              title="Direct Excel (.xlsx) & CSV Import/Export"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span className="hidden xl:inline text-xs font-semibold">Import / Export</span>
            </button>

            {/* Desktop-only secondary tools */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={onClearAll}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                title="Clean All CRM Leads"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={onResetSeed}
                className="p-2 rounded-lg text-slate-400 hover:text-amber-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                title="Load Sample IT Leads"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile More Options Dropdown Toggle */}
            <div className="relative sm:hidden">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMoreMenu && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1 z-50 text-xs"
                  onClick={() => setShowMoreMenu(false)}
                >
                  <button
                    onClick={onResetSeed}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reset Demo Leads</span>
                  </button>
                  <button
                    onClick={onClearAll}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-950/40 text-rose-300 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Clean All Leads</span>
                  </button>
                </div>
              )}
            </div>

            {/* Create New Lead CTA */}
            <button
              onClick={onOpenNewLead}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs">Add Lead</span>
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="pb-2 md:hidden">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search companies, contacts, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

      </div>

      {/* Mobile Bottom Navigation Bar (iPhone & Android with Safe Area) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl px-1 pt-1.5 safe-area-pb flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setCurrentView('kanban')}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl transition-all ${
            currentView === 'kanban'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Columns3 className="w-4 h-4" />
          <span className="text-[10px]">Pipeline</span>
        </button>

        <button
          onClick={() => setCurrentView('divisions')}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl transition-all ${
            currentView === 'divisions'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px]">Divisions</span>
        </button>

        <button
          onClick={() => setCurrentView('table')}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl transition-all ${
            currentView === 'table'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table className="w-4 h-4" />
          <span className="text-[10px]">Table</span>
        </button>

        <button
          onClick={() => setCurrentView('calendar')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            currentView === 'calendar'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[10px]">Calendar</span>
        </button>

        <button
          onClick={() => setCurrentView('tasks')}
          className={`relative flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            currentView === 'tasks'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span className="text-[10px]">Reminders</span>
          {overdueTasksCount > 0 && (
            <span className="absolute top-0 right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full text-[8px] font-bold bg-rose-500 text-white animate-pulse">
              {overdueTasksCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentView('templates')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            currentView === 'templates'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px]">Proposals</span>
        </button>

        <button
          onClick={() => setCurrentView('analytics')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            currentView === 'analytics'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-[10px]">Analytics</span>
        </button>
      </div>
    </header>
  );
}
