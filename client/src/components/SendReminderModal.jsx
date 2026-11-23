import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  MessageCircle, 
  Mail, 
  PhoneCall, 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  ExternalLink,
  User,
  Building2,
  Briefcase
} from 'lucide-react';
import { 
  FORMAT_CURRENCY, 
  GET_WHATSAPP_LINK, 
  GET_SMS_LINK, 
  GET_EMAIL_LINK 
} from '../constants/crm';
import { crmApi } from '../api/crmApi';

const REMINDER_TEMPLATES = [
  {
    id: 'proposal_followup',
    name: 'Proposal & Quotation Follow-up',
    subject: 'Follow-up on {service} Proposal - Aigentle IT Services',
    body: 'Hi {contact_person}, gentle reminder regarding the proposal for {service} sent by Aigentle IT Services. Have you had a chance to review the scope and pricing? We would be delighted to schedule a quick call to address any questions.'
  },
  {
    id: 'discussion_followup',
    name: 'App Development Inquiry Follow-up',
    subject: 'Your Inquiry for {service} - Aigentle IT Services',
    body: 'Hi {contact_person}, this is regarding your inquiry for {service} with Aigentle IT Services. Our development team is ready to assist you. When would be a convenient time for a brief 10-minute discovery call?'
  },
  {
    id: 'meeting_reminder',
    name: 'Meeting / Call Reminder',
    subject: 'Reminder: Scheduled Discussion regarding {service}',
    body: 'Hi {contact_person}, this is a friendly reminder of our scheduled call today regarding your {service} requirements. Looking forward to speaking with you!'
  },
  {
    id: 'milestone_reminder',
    name: 'Project Milestone / Advance Reminder',
    subject: 'Milestone Update - {service} with Aigentle',
    body: 'Dear {contact_person}, gentle reminder regarding the kickoff milestone for {service} ({deal_value}). Please let us know once initiated so our team can schedule sprint allocation.'
  },
  {
    id: 'custom',
    name: 'Custom Reminder Message',
    subject: 'Update from Aigentle IT Services',
    body: 'Hi {contact_person}, following up on our recent conversation regarding {service}. Please let us know how you would like to proceed.'
  }
];

export default function SendReminderModal({
  isOpen,
  onClose,
  lead,
  onReminderSent,
  currency = 'INR'
}) {
  if (!isOpen || !lead) return null;

  const [channel, setChannel] = useState('whatsapp'); // 'whatsapp' | 'email' | 'sms'
  const [selectedTemplateId, setSelectedTemplateId] = useState('discussion_followup');
  const [subjectText, setSubjectText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [scheduleFollowup, setScheduleFollowup] = useState(true);
  const [followupDate, setFollowupDate] = useState(() => {
    // Default tomorrow at 11:00 AM
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(11, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // Helper to replace placeholders
  const formatTemplateString = (str) => {
    if (!str) return '';
    return str
      .replace(/{contact_person}/g, lead.contact_person || 'Client')
      .replace(/{company_name}/g, lead.company_name || 'your company')
      .replace(/{service}/g, lead.service || 'Software Development')
      .replace(/{deal_value}/g, FORMAT_CURRENCY(lead.deal_value || 0, currency));
  };

  // Synchronize message body when template or lead changes
  useEffect(() => {
    const tmpl = REMINDER_TEMPLATES.find(t => t.id === selectedTemplateId) || REMINDER_TEMPLATES[0];
    setSubjectText(formatTemplateString(tmpl.subject));
    setMessageText(formatTemplateString(tmpl.body));
  }, [selectedTemplateId, lead]);

  // Quick follow-up preset selector
  const setQuickFollowupDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(11, 0, 0, 0);
    setFollowupDate(d.toISOString().slice(0, 16));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendReminder = async () => {
    try {
      setIsSending(true);

      // 1. Dispatch through appropriate protocol
      let targetUrl = null;
      if (channel === 'whatsapp') {
        if (!lead.phone) {
          alert('This lead does not have a phone number entered.');
          setIsSending(false);
          return;
        }
        targetUrl = GET_WHATSAPP_LINK(lead.phone, messageText);
        window.open(targetUrl, '_blank');
      } else if (channel === 'email') {
        if (!lead.email) {
          alert('This lead does not have an email address entered.');
          setIsSending(false);
          return;
        }
        targetUrl = GET_EMAIL_LINK(lead.email, subjectText, messageText);
        window.location.href = targetUrl;
      } else if (channel === 'sms') {
        if (!lead.phone) {
          alert('This lead does not have a phone number entered.');
          setIsSending(false);
          return;
        }
        targetUrl = GET_SMS_LINK(lead.phone, messageText);
        window.location.href = targetUrl;
      }

      // 2. Automatically log reminder in activity history
      const channelLabel = channel === 'whatsapp' ? 'WhatsApp' : channel === 'email' ? 'Email' : 'SMS';
      const tmplObj = REMINDER_TEMPLATES.find(t => t.id === selectedTemplateId);
      const tmplName = tmplObj ? tmplObj.name : 'Custom Reminder';

      await crmApi.logActivity({
        lead_id: lead.id,
        type: 'Reminder',
        summary: `Sent ${channelLabel} Reminder: ${tmplName}`,
        details: `Dispatched to ${lead.contact_person} (${channel === 'email' ? lead.email : lead.phone}). Message content: "${messageText}"`
      });

      // 3. Update next follow-up and create task if selected
      if (scheduleFollowup && followupDate) {
        const formattedFollowup = new Date(followupDate).toISOString();
        await crmApi.updateLead(lead.id, {
          next_followup: formattedFollowup
        });
        await crmApi.createTask({
          lead_id: lead.id,
          title: `Follow-up call with ${lead.contact_person} (${channelLabel} sent)`,
          due_date: formattedFollowup
        });
      }

      setStatusMessage(`✓ ${channelLabel} reminder sent & logged in CRM activity history!`);
      if (onReminderSent) onReminderSent();

      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1800);

    } catch (err) {
      console.error('Error logging reminder:', err);
      alert('Reminder dispatched, but could not record activity in database.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Container: Bottom-sheet on mobile, centered modal on tablet/desktop */}
      <div 
        className="w-full sm:max-w-2xl bg-slate-950 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden safe-area-pb animate-in slide-in-from-bottom-6 sm:fade-in-50 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Send Client Reminder
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase">
                  1-Click Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Send professional follow-ups to <span className="text-slate-200 font-medium">{lead.contact_person}</span> ({lead.company_name})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 touch-scroll text-xs">
          
          {/* Status Message */}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Client Quick Info Strip */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Client</span>
              <span className="text-slate-200 font-medium truncate block">{lead.contact_person}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Phone</span>
              <span className="text-slate-200 font-mono block">{lead.phone || 'No phone'}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Service</span>
              <span className="text-indigo-300 font-medium truncate block">{lead.service}</span>
            </div>
          </div>

          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Reminder Channel:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  channel === 'whatsapp'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('email')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  channel === 'email'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>Email</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('sms')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  channel === 'sms'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 ring-2 ring-purple-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <PhoneCall className="w-4 h-4 text-purple-400" />
                <span>SMS</span>
              </button>
            </div>
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Reminder Template:
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {REMINDER_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Email Subject Field (Only when Email channel selected) */}
          {channel === 'email' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Subject:
              </label>
              <input
                type="text"
                value={subjectText}
                onChange={(e) => setSubjectText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Live Message Text Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Message Preview & Editor:</span>
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
              placeholder="Type your reminder message..."
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Placeholders ({`{contact_person}`}, {`{service}`}, etc.) are dynamically converted.
            </span>
          </div>

          {/* Auto Schedule Follow-up Checkbox */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleFollowup}
                  onChange={(e) => setScheduleFollowup(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-200">
                  Update Next Follow-up in CRM
                </span>
              </label>

              <div className="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setQuickFollowupDays(1)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFollowupDays(3)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  +3 Days
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFollowupDays(7)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  +1 Week
                </button>
              </div>
            </div>

            {scheduleFollowup && (
              <div className="pt-1">
                <input
                  type="datetime-local"
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSendReminder}
            disabled={isSending || !messageText.trim()}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-[0.98] ${
              channel === 'whatsapp'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : channel === 'email'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isSending ? 'Dispatching...' : `Send Reminder via ${channel === 'whatsapp' ? 'WhatsApp' : channel === 'email' ? 'Email' : 'SMS'}`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
