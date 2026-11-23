import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { crmApi } from './api/crmApi';
import Navbar from './components/Navbar';
import StatsBar from './components/StatsBar';
import KanbanBoard from './components/KanbanBoard';
import LeadTable from './components/LeadTable';
import LeadDetailDrawer from './components/LeadDetailDrawer';
import LeadFormModal from './components/LeadFormModal';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import DivisionsView from './components/DivisionsView';
import TasksView from './components/TasksView';
import EmailTemplateModal from './components/EmailTemplateModal';
import CsvImportExportModal from './components/CsvImportExportModal';
import SendReminderModal from './components/SendReminderModal';
import CallNotReceivedModal from './components/CallNotReceivedModal';
import { STAGES } from './constants/crm';

export default function App() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active view: 'kanban' | 'table' | 'calendar' | 'divisions' | 'analytics' | 'tasks' | 'templates'
  const [currentView, setCurrentView] = useState('kanban');

  // Stage focus navigation
  const [targetStageForKanban, setTargetStageForKanban] = useState('all');

  // Global filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [currency, setCurrency] = useState('INR');

  // Sorting
  const [sortField, setSortField] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals state
  const [selectedLeadForDrawer, setSelectedLeadForDrawer] = useState(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isEmailTemplateOpen, setIsEmailTemplateOpen] = useState(false);
  const [leadForEmailTemplate, setLeadForEmailTemplate] = useState(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [leadForReminder, setLeadForReminder] = useState(null);
  const [isCallNotReceivedOpen, setIsCallNotReceivedOpen] = useState(false);
  const [leadForCallNotReceived, setLeadForCallNotReceived] = useState(null);

  const handleOpenReminder = (lead) => {
    setLeadForReminder(lead);
    setIsReminderModalOpen(true);
  };

  const handleOpenCallNotReceived = (lead) => {
    setLeadForCallNotReceived(lead);
    setIsCallNotReceivedOpen(true);
  };

  // Fetch leads and pipeline statistics
  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsRes, statsRes] = await Promise.all([
        crmApi.getLeads({
          search: searchQuery,
          service: selectedService,
          priority: selectedPriority,
          owner: selectedOwner
        }),
        crmApi.getStats()
      ]);

      if (leadsRes.success) {
        setLeads(leadsRes.data);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Error loading CRM data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedService, selectedPriority, selectedOwner]);

  // Stage change with celebratory confetti on Closed Won!
  const handleStageChange = async (leadId, newStage) => {
    try {
      const res = await crmApi.updateLeadStage(leadId, newStage);
      if (res.success) {
        setLeads(prev => prev.map(l => l.id === leadId ? res.data : l));
        
        // Trigger celebratory confetti if deal is won!
        if (newStage === 'Closed Won') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }

        // Refresh stats in background
        const statsRes = await crmApi.getStats();
        if (statsRes.success) setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Error updating stage:', err);
    }
  };

  // Lead Creation
  const handleCreateLead = async (formData) => {
    const res = await crmApi.createLead(formData);
    if (res.success) {
      loadData();
    }
  };

  // Lead Update
  const handleUpdateLead = (updatedLead) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    crmApi.getStats().then(s => s.success && setStats(s.data));
  };

  // Delete Lead
  const handleDeleteLead = async (id) => {
    const res = await crmApi.deleteLead(id);
    if (res.success) {
      setLeads(prev => prev.filter(l => l.id !== id));
      if (selectedLeadForDrawer && selectedLeadForDrawer.id === id) {
        setSelectedLeadForDrawer(null);
      }
      crmApi.getStats().then(s => s.success && setStats(s.data));
    }
  };

  // Bulk Operations
  const handleBulkDelete = async (ids) => {
    const res = await crmApi.bulkDeleteLeads(ids);
    if (res.success) {
      loadData();
    }
  };

  const handleBulkStageChange = async (ids, stage) => {
    const res = await crmApi.bulkUpdateStage(ids, stage);
    if (res.success) {
      if (stage === 'Closed Won') {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
      loadData();
    }
  };

  // Lead Verification & Division Management
  const handleVerifyLead = async (id, is_verified, division) => {
    try {
      const res = await crmApi.verifyLead(id, { is_verified, division });
      if (res.success) {
        setLeads(prev => prev.map(l => l.id === id ? res.data : l));
        if (selectedLeadForDrawer && selectedLeadForDrawer.id === id) {
          setSelectedLeadForDrawer(res.data);
        }
        crmApi.getStats().then(s => s.success && setStats(s.data));
      }
    } catch (err) {
      console.error('Error verifying lead:', err);
    }
  };

  const handleUpdateDivision = async (id, division) => {
    try {
      const res = await crmApi.updateLead(id, { division });
      if (res.success) {
        setLeads(prev => prev.map(l => l.id === id ? res.data : l));
        if (selectedLeadForDrawer && selectedLeadForDrawer.id === id) {
          setSelectedLeadForDrawer(res.data);
        }
      }
    } catch (err) {
      console.error('Error updating division:', err);
    }
  };

  const handleBulkVerify = async (ids, is_verified, division) => {
    try {
      const res = await crmApi.bulkVerifyLeads(ids, is_verified, division);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      console.error('Error bulk verifying leads:', err);
    }
  };

  // Reset Demo Leads
  const handleResetSeed = async () => {
    if (window.confirm('Load sample Aigentle IT Services demo leads? This will overwrite current records.')) {
      try {
        const res = await crmApi.resetSeed();
        if (res.success) {
          loadData();
        }
      } catch (err) {
        console.error('Error resetting seed:', err);
      }
    }
  };

  // Clear All Leads
  const handleClearAll = async () => {
    if (window.confirm('Wipe and clear all CRM leads and activities? You will have a clean slate to add your own leads.')) {
      try {
        const res = await crmApi.clearAllLeads();
        if (res.success) {
          loadData();
        }
      } catch (err) {
        console.error('Error clearing data:', err);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currency={currency}
        setCurrency={setCurrency}
        onOpenNewLead={() => setIsNewLeadModalOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onResetSeed={handleResetSeed}
        onClearAll={handleClearAll}
        overdueTasksCount={stats?.overdueTasks || 0}
      />

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-24 md:py-6">
        
        {/* KPI & Metrics Bar */}
        <StatsBar stats={stats} currency={currency} />

        {/* Clean Slate Welcome Banner when 0 leads */}
        {!loading && leads.length === 0 && (
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                  CRM Clean & Ready For Your Leads
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Start Managing Aigentle IT Service Leads
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                The database is clean with zero sample data. You can now add your own prospective clients or import your lead list via CSV.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsImportExportOpen(true)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Import CSV File
              </button>
              <button
                onClick={() => setIsNewLeadModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                + Add Your First Lead
              </button>
            </div>
          </div>
        )}

        {/* View Routing */}
        {loading && leads.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-2 text-indigo-400">
              <span className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading Aigentle CRM Pipeline...</span>
            </div>
          </div>
        ) : (
          <>
            {currentView === 'kanban' && (
              <KanbanBoard
                leads={leads}
                onLeadClick={(lead) => setSelectedLeadForDrawer(lead)}
                onStageChange={handleStageChange}
                currency={currency}
                selectedService={selectedService}
                setSelectedService={setSelectedService}
                selectedPriority={selectedPriority}
                setSelectedPriority={setSelectedPriority}
                selectedOwner={selectedOwner}
                setSelectedOwner={setSelectedOwner}
                initialStageFilter={targetStageForKanban}
                onOpenReminder={handleOpenReminder}
                onOpenCallNotReceived={handleOpenCallNotReceived}
                onVerifyLead={handleVerifyLead}
              />
            )}

            {currentView === 'table' && (
              <LeadTable
                leads={leads}
                onLeadClick={(lead) => setSelectedLeadForDrawer(lead)}
                onStageChange={handleStageChange}
                onDeleteLead={handleDeleteLead}
                onBulkDelete={handleBulkDelete}
                onBulkStageChange={handleBulkStageChange}
                currency={currency}
                sortField={sortField}
                setSortField={setSortField}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                initialStageFilter={targetStageForKanban}
                onOpenReminder={handleOpenReminder}
                onOpenCallNotReceived={handleOpenCallNotReceived}
                onVerifyLead={handleVerifyLead}
                onBulkVerify={handleBulkVerify}
              />
            )}

            {currentView === 'calendar' && (
              <CalendarView
                leads={leads}
                onLeadClick={(lead) => setSelectedLeadForDrawer(lead)}
                onStageChange={handleStageChange}
                currency={currency}
                onOpenNewLead={() => setIsNewLeadModalOpen(true)}
                onOpenReminder={handleOpenReminder}
                onOpenCallNotReceived={handleOpenCallNotReceived}
              />
            )}

            {currentView === 'divisions' && (
              <DivisionsView
                leads={leads}
                onLeadClick={(lead) => setSelectedLeadForDrawer(lead)}
                onVerifyLead={handleVerifyLead}
                onUpdateDivision={handleUpdateDivision}
                currency={currency}
                onOpenReminder={handleOpenReminder}
                onOpenCallNotReceived={handleOpenCallNotReceived}
              />
            )}

            {currentView === 'analytics' && (
              <AnalyticsView
                stats={stats}
                currency={currency}
                onSelectStage={(stage) => {
                  setTargetStageForKanban(stage);
                  setCurrentView('kanban');
                }}
              />
            )}

            {currentView === 'tasks' && (
              <TasksView
                leads={leads}
                onOpenLead={(lead) => setSelectedLeadForDrawer(lead)}
                onRefreshStats={loadData}
                onOpenReminder={handleOpenReminder}
                onOpenCallNotReceived={handleOpenCallNotReceived}
              />
            )}

            {currentView === 'templates' && (
              <EmailTemplateModal
                isEmbedded={true}
                leads={leads}
                currency={currency}
              />
            )}
          </>
        )}

      </main>

      {/* Modals & Drawers */}

      {/* 1. Lead Profile / Detail Drawer */}
      {selectedLeadForDrawer && (
        <LeadDetailDrawer
          leadId={selectedLeadForDrawer.id}
          onClose={() => setSelectedLeadForDrawer(null)}
          onUpdateLead={handleUpdateLead}
          onDeleteLead={handleDeleteLead}
          onOpenEmailTemplate={(lead) => {
            setLeadForEmailTemplate(lead);
            setIsEmailTemplateOpen(true);
          }}
          currency={currency}
          onViewStageInBoard={(stage) => {
            setTargetStageForKanban(stage);
            setCurrentView('kanban');
          }}
          onOpenReminder={handleOpenReminder}
          onOpenCallNotReceived={handleOpenCallNotReceived}
        />
      )}

      {/* 2. Add New Lead Modal */}
      <LeadFormModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onSave={handleCreateLead}
        currency={currency}
      />

      {/* 3. CSV Import / Export Modal */}
      <CsvImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        leads={leads}
        onImportSuccess={loadData}
      />

      {/* 4. IT Proposal & Email Generator Modal */}
      <EmailTemplateModal
        isOpen={isEmailTemplateOpen}
        onClose={() => setIsEmailTemplateOpen(false)}
        initialLead={leadForEmailTemplate}
        leads={leads}
        currency={currency}
      />

      {/* 5. Client Follow-up & Reminder Dispatch Modal */}
      <SendReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        lead={leadForReminder}
        onReminderSent={loadData}
        currency={currency}
      />

      {/* 6. Call Not Received / Not Answered Follow-up Modal */}
      <CallNotReceivedModal
        isOpen={isCallNotReceivedOpen}
        onClose={() => setIsCallNotReceivedOpen(false)}
        lead={leadForCallNotReceived}
        onSuccess={loadData}
      />

    </div>
  );
}
