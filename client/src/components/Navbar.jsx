import React from 'react';
import { 
  Columns3, 
  Table, 
  BarChart3, 
  CalendarClock, 
  FileText, 
  Plus, 
  Search, 
  Download, 
  RotateCcw,
  Sparkles,
  Bot,
  Trash2
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
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  Aigentle <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">CRM</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  IT Services
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Intelligent Lead Pipeline & Deal Tracker</p>
            </div>
          </div>

          {/* Search Box */}
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
          <div className="flex items-center gap-2">
            
            {/* Currency Selector */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs text-slate-300">
              {Object.keys(CURRENCY_SYMBOLS).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    currency === curr ? 'bg-slate-800 text-indigo-400 font-bold' : 'hover:text-white'
                  }`}
                  title={`View in ${curr}`}
                >
                  {CURRENCY_SYMBOLS[curr]}
                </button>
              ))}
            </div>

            {/* CSV Import/Export */}
            <button
              onClick={onOpenImportExport}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Import or Export Leads CSV"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Wipe / Clean CRM */}
            <button
              onClick={onClearAll}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Clean All CRM Leads"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Reset Demo Leads */}
            <button
              onClick={onResetSeed}
              className="p-2 rounded-lg text-slate-400 hover:text-amber-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Load Sample IT Leads"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Create New Lead CTA */}
            <button
              onClick={onOpenNewLead}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Lead</span>
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads, services, contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

      </div>

      {/* Mobile Bottom Navigation Bar (iPhone & Android) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl px-2 py-2 flex items-center justify-around shadow-2xl safe-area-pb">
        <button
          onClick={() => setCurrentView('kanban')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentView === 'kanban'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Columns3 className="w-4 h-4" />
          <span className="text-[10px]">Pipeline</span>
        </button>

        <button
          onClick={() => setCurrentView('table')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentView === 'table'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table className="w-4 h-4" />
          <span className="text-[10px]">Table</span>
        </button>

        <button
          onClick={() => setCurrentView('analytics')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentView === 'analytics'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-[10px]">Analytics</span>
        </button>

        <button
          onClick={() => setCurrentView('tasks')}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentView === 'tasks'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span className="text-[10px]">Tasks</span>
          {overdueTasksCount > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold bg-rose-500 text-white">
              {overdueTasksCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentView('templates')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentView === 'templates'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px]">Proposals</span>
        </button>
      </div>
    </header>
  );
}
