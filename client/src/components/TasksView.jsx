import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crmApi';
import { 
  CalendarClock, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Phone, 
  Mail, 
  ExternalLink, 
  Plus, 
  Trash2,
  Building2,
  User,
  Filter
} from 'lucide-react';
import { PRIORITIES } from '../constants/crm';

export default function TasksView({ onOpenLead, leads, onRefreshStats }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('pending'); // 'pending', 'overdue', 'today', 'completed'

  // New task modal/form
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await crmApi.getTasks('all');
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleTask = async (id) => {
    try {
      await crmApi.toggleTask(id);
      fetchTasks();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await crmApi.deleteTask(id);
      fetchTasks();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedLeadId || !taskTitle.trim() || !taskDueDate) return;

    try {
      setSaving(true);
      const res = await crmApi.createTask({
        lead_id: Number(selectedLeadId),
        title: taskTitle.trim(),
        due_date: taskDueDate
      });

      if (res.success) {
        setShowAddModal(false);
        setTaskTitle('');
        setTaskDueDate('');
        fetchTasks();
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.error('Error creating task:', err);
    } finally {
      setSaving(false);
    }
  };

  const now = new Date();

  // Filter categorization
  const overdueTasks = tasks.filter(t => !t.completed && new Date(t.due_date) < now);
  const todayTasks = tasks.filter(t => {
    if (t.completed) return false;
    const d = new Date(t.due_date);
    return d.toDateString() === now.toDateString();
  });
  const upcomingTasks = tasks.filter(t => !t.completed && new Date(t.due_date) > now && new Date(t.due_date).toDateString() !== now.toDateString());
  const completedTasks = tasks.filter(t => t.completed);

  let displayedTasks = tasks;
  if (filterTab === 'overdue') displayedTasks = overdueTasks;
  else if (filterTab === 'today') displayedTasks = todayTasks;
  else if (filterTab === 'upcoming') displayedTasks = upcomingTasks;
  else if (filterTab === 'completed') displayedTasks = completedTasks;
  else displayedTasks = tasks.filter(t => !t.completed); // 'pending'

  return (
    <div className="space-y-5">
      
      {/* Top Header & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-indigo-400" />
            Lead Follow-up & Task Agenda
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Never drop a deal. Track call reminders, proposal follow-ups, and meeting schedules.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule Follow-up
        </button>
      </div>

      {/* Overdue Warning Callout (if any exist) */}
      {overdueTasks.length > 0 && filterTab !== 'overdue' && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertCircle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-200">
                You have {overdueTasks.length} overdue follow-up{overdueTasks.length > 1 ? 's' : ''}!
              </h4>
              <p className="text-xs text-rose-300/80">
                Reach out to these leads promptly to keep conversion momentum high.
              </p>
            </div>
          </div>

          <button
            onClick={() => setFilterTab('overdue')}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0"
          >
            Review Overdue
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setFilterTab('pending')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterTab === 'pending' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          All Active ({tasks.filter(t => !t.completed).length})
        </button>

        <button
          onClick={() => setFilterTab('overdue')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterTab === 'overdue' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Overdue
          {overdueTasks.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/30 text-rose-200 font-bold">
              {overdueTasks.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilterTab('today')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterTab === 'today' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Today ({todayTasks.length})
        </button>

        <button
          onClick={() => setFilterTab('upcoming')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterTab === 'upcoming' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Upcoming ({upcomingTasks.length})
        </button>

        <button
          onClick={() => setFilterTab('completed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterTab === 'completed' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Completed ({completedTasks.length})
        </button>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading tasks...</div>
        ) : displayedTasks.length === 0 ? (
          <div className="p-12 rounded-xl bg-slate-900/40 border border-slate-800 text-center">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-medium">No tasks found in this view.</p>
            <p className="text-xs text-slate-500 mt-1">Great job! All follow-ups are up to date.</p>
          </div>
        ) : (
          displayedTasks.map((t) => {
            const dueDate = new Date(t.due_date);
            const isOverdue = dueDate < now && !t.completed;
            const isToday = dueDate.toDateString() === now.toDateString() && !t.completed;

            return (
              <div
                key={t.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  t.completed ? 'bg-slate-950/40 border-slate-800/40 opacity-60' :
                  isOverdue ? 'bg-rose-950/20 border-rose-500/30' :
                  isToday ? 'bg-amber-950/20 border-amber-500/30' :
                  'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Checkbox and Task Details */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={t.completed === 1}
                    onChange={() => handleToggleTask(t.id)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <div className="min-w-0">
                    <h4 className={`text-sm font-semibold ${t.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                      {t.title}
                    </h4>

                    {/* Associated Lead Info */}
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span className="font-medium text-slate-200 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                        {t.company_name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {t.contact_person}
                      </span>
                      <span>•</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {t.service}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Due Date & Quick Contact Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                  <div className="text-right">
                    <div className={`text-xs font-semibold flex items-center gap-1 ${
                      isOverdue ? 'text-rose-400 font-bold' : isToday ? 'text-amber-400' : 'text-slate-300'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      {dueDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {isOverdue ? 'Overdue!' : isToday ? 'Due Today' : 'Scheduled'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {t.phone && (
                      <a
                        href={`tel:${t.phone}`}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400"
                        title={`Call ${t.phone}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {t.email && (
                      <a
                        href={`mailto:${t.email}`}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-indigo-400"
                        title={`Email ${t.email}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={() => onOpenLead({ id: t.lead_id, company_name: t.company_name })}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                      title="Open Lead Profile"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-500 hover:text-rose-400"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowAddModal(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl z-10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-indigo-400" />
              Schedule Follow-up Task
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Select Target Lead *</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  required
                >
                  <option value="">Choose a lead...</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.company_name} ({l.contact_person}) - {l.service}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Task Title / Agenda *</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule solution demo / Send revised quotation"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !selectedLeadId || !taskTitle || !taskDueDate}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow"
                >
                  {saving ? 'Scheduling...' : 'Save Follow-up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
