import React, { useState } from 'react';
import { 
  X, 
  PhoneMissed, 
  Calendar, 
  Clock, 
  MessageCircle, 
  CheckCircle2, 
  Send, 
  User, 
  Building2, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { GET_WHATSAPP_LINK } from '../constants/crm';
import { crmApi } from '../api/crmApi';

export default function CallNotReceivedModal({
  isOpen,
  onClose,
  lead,
  onSuccess
}) {
  if (!isOpen || !lead) return null;

  // Follow-up timing preset: '2h' | '4h' | 'tomorrow' | 'day_after' | 'custom'
  const [timingPreset, setTimingPreset] = useState('tomorrow');
  
  // Custom datetime
  const [customDateTime, setCustomDateTime] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(11, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  // Calculate actual scheduled ISO date based on preset
  const getCalculatedDate = () => {
    const now = new Date();
    if (timingPreset === '2h') {
      now.setHours(now.getHours() + 2);
      return now;
    }
    if (timingPreset === '4h') {
      now.setHours(now.getHours() + 4);
      return now;
    }
    if (timingPreset === 'tomorrow') {
      now.setDate(now.getDate() + 1);
      now.setHours(11, 0, 0, 0);
      return now;
    }
    if (timingPreset === 'day_after') {
      now.setDate(now.getDate() + 2);
      now.setHours(11, 0, 0, 0);
      return now;
    }
    return new Date(customDateTime);
  };

  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [whatsAppMessage, setWhatsAppMessage] = useState(
    `Hi ${lead.contact_person || 'Client'}, I tried calling you regarding your inquiry for ${lead.service || 'our services'} with Aigentle IT Services. Please let me know what time works best for a brief callback. Thank you!`
  );

  const [moveStageToContacted, setMoveStageToContacted] = useState(lead.stage === 'New');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const targetFollowupDate = getCalculatedDate().toISOString();
      const formattedFriendlyDate = getCalculatedDate().toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // 1. Update Lead: set next_followup, and optionally stage to 'Contacted' if currently 'New'
      const updatePayload = {
        next_followup: targetFollowupDate
      };
      if (moveStageToContacted && lead.stage === 'New') {
        updatePayload.stage = 'Contacted';
      }
      await crmApi.updateLead(lead.id, updatePayload);

      // 2. Log Activity
      await crmApi.logActivity({
        lead_id: lead.id,
        type: 'Call',
        summary: 'Call Not Received / Not Answered',
        details: `Attempted call to ${lead.contact_person} (${lead.phone || 'No phone'}). Client did not pick up. Scheduled next follow-up call for ${formattedFriendlyDate}.`
      });

      // 3. Create a Follow-up Task in CRM
      await crmApi.createTask({
        lead_id: lead.id,
        title: `Retry call: ${lead.contact_person} (Previous call not answered)`,
        due_date: targetFollowupDate
      });

      // 4. If WhatsApp notification enabled, open WhatsApp
      if (sendWhatsApp && lead.phone) {
        const waLink = GET_WHATSAPP_LINK(lead.phone, whatsAppMessage);
        window.open(waLink, '_blank');
      }

      setStatusMessage(`✓ Scheduled follow-up for ${formattedFriendlyDate}!`);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Error recording missed call follow-up:', err);
      alert('Could not schedule follow-up. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-lg bg-slate-950 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden safe-area-pb"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <PhoneMissed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Call Not Received
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold uppercase">
                  Schedule Follow-up
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Client didn't answer? Move <span className="text-white font-medium">{lead.contact_person}</span> to follow-up list
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 touch-scroll text-xs">
          
          {/* Status Alert Banner */}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Client Info Pill */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Lead Contact</span>
              <span className="font-semibold text-white">{lead.contact_person}</span>
              <span className="text-slate-400 text-[11px] block">{lead.company_name}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Phone</span>
              <span className="font-mono text-slate-200">{lead.phone || 'No phone'}</span>
            </div>
          </div>

          {/* Quick Follow-up Timing Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              When should we call back? (Next Follow-up)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setTimingPreset('2h')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  timingPreset === '2h'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold ring-2 ring-rose-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4 mx-auto mb-1 text-rose-400" />
                <span className="block text-xs">In 2 Hours</span>
                <span className="text-[10px] text-slate-500">Later today</span>
              </button>

              <button
                type="button"
                onClick={() => setTimingPreset('4h')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  timingPreset === '4h'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold ring-2 ring-rose-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                <span className="block text-xs">In 4 Hours</span>
                <span className="text-[10px] text-slate-500">This evening</span>
              </button>

              <button
                type="button"
                onClick={() => setTimingPreset('tomorrow')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  timingPreset === 'tomorrow'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold ring-2 ring-cyan-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                <span className="block text-xs">Tomorrow</span>
                <span className="text-[10px] text-slate-500">11:00 AM</span>
              </button>

              <button
                type="button"
                onClick={() => setTimingPreset('day_after')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  timingPreset === 'day_after'
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold ring-2 ring-indigo-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4 mx-auto mb-1 text-indigo-400" />
                <span className="block text-xs">In 2 Days</span>
                <span className="text-[10px] text-slate-500">Morning</span>
              </button>
            </div>

            {/* Custom Datetime Option */}
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTimingPreset('custom')}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                  timingPreset === 'custom'
                    ? 'bg-indigo-600 text-white font-bold border-indigo-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Custom Date & Time
              </button>

              {timingPreset === 'custom' && (
                <input
                  type="datetime-local"
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              )}
            </div>
          </div>

          {/* Stage Progression Option */}
          {lead.stage === 'New' && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Move Stage from "New" to "Contacted"
                </span>
                <span className="text-[10px] text-slate-400">
                  Marks this lead as reached out to in your pipeline
                </span>
              </div>
              <input
                type="checkbox"
                checked={moveStageToContacted}
                onChange={(e) => setMoveStageToContacted(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Optional: Send 'Tried Calling You' WhatsApp Message */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  disabled={!lead.phone}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Send "Tried Calling You" WhatsApp Note
                </span>
              </label>

              {!lead.phone && (
                <span className="text-[10px] text-rose-400">No phone number</span>
              )}
            </div>

            {sendWhatsApp && lead.phone && (
              <textarea
                rows={3}
                value={whatsAppMessage}
                onChange={(e) => setWhatsAppMessage(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                placeholder="WhatsApp message text..."
              />
            )}
          </div>

          {/* Footer Submit */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all active:scale-[0.98]"
            >
              <PhoneMissed className="w-3.5 h-3.5" />
              <span>
                {isSubmitting ? 'Scheduling...' : 'Confirm Call Not Received & Move to Follow-up'}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
