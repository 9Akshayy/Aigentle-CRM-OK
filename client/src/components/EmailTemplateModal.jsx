import React, { useState, useEffect } from 'react';
import { crmApi } from '../api/crmApi';
import { FORMAT_CURRENCY } from '../constants/crm';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Mail, 
  Send, 
  FileText, 
  X,
  Building2,
  User
} from 'lucide-react';

export default function EmailTemplateModal({
  isOpen,
  onClose,
  initialLead,
  leads = [],
  currency,
  isEmbedded = false
}) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const res = await crmApi.getTemplates();
        if (res.success && res.data.length > 0) {
          setTemplates(res.data);
          setSelectedTemplateId(res.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  // Set initial lead if provided
  useEffect(() => {
    if (initialLead && initialLead.id) {
      setSelectedLeadId(initialLead.id.toString());
    } else if (leads.length > 0 && !selectedLeadId) {
      setSelectedLeadId(leads[0].id.toString());
    }
  }, [initialLead, leads]);

  // Interpolate template placeholders when lead or template changes
  useEffect(() => {
    const tmpl = templates.find(t => t.id === selectedTemplateId);
    const lead = leads.find(l => l.id.toString() === selectedLeadId.toString()) || initialLead;

    if (!tmpl) return;

    if (!lead) {
      setSubject(tmpl.subject);
      setBody(tmpl.body);
      return;
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const preferredDay = days[(new Date().getDay() + 1) % 5] || 'Thursday';

    const replacements = {
      '{{company_name}}': lead.company_name || 'Your Company',
      '{{contact_person}}': lead.contact_person || 'Partner',
      '{{service}}': lead.service || 'Technology Solutions',
      '{{deal_value}}': FORMAT_CURRENCY(lead.deal_value, currency),
      '{{owner}}': lead.owner || 'Alex Mercer',
      '{{preferred_day}}': preferredDay
    };

    let populatedSubject = tmpl.subject;
    let populatedBody = tmpl.body;

    Object.entries(replacements).forEach(([key, val]) => {
      populatedSubject = populatedSubject.split(key).join(val);
      populatedBody = populatedBody.split(key).join(val);
    });

    setSubject(populatedSubject);
    setBody(populatedBody);
  }, [selectedTemplateId, selectedLeadId, templates, leads, initialLead, currency]);

  if (!isOpen && !isEmbedded) return null;

  const currentLead = leads.find(l => l.id.toString() === selectedLeadId.toString()) || initialLead;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenMailto = () => {
    const to = currentLead && currentLead.email ? currentLead.email : '';
    const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  const containerClass = isEmbedded
    ? "w-full bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col"
    : "relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]";

  const content = (
    <div className={containerClass}>
      {/* Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">IT Services Proposal & Email Assistant</h2>
            <p className="text-xs text-slate-400">Generate high-converting personalized sales emails and scope outlines</p>
          </div>
        </div>
        {!isEmbedded && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto space-y-4 text-xs">
        
        {/* Selectors Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <label className="text-slate-400 font-medium block mb-1.5">
              Target Lead & Client:
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-medium focus:ring-1 focus:ring-indigo-500"
            >
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.company_name} ({l.contact_person}) - {l.service}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-medium block mb-1.5">
              Email / Proposal Template:
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-medium focus:ring-1 focus:ring-indigo-500"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lead Recipient pill */}
        {currentLead && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Sending to:</span>
              <span className="font-semibold text-white">{currentLead.contact_person}</span>
              <span>({currentLead.email || 'No email saved'})</span>
            </div>
            <span className="text-indigo-400 font-medium">Service: {currentLead.service}</span>
          </div>
        )}

        {/* Subject Field */}
        <div>
          <label className="text-slate-300 font-semibold block mb-1">Subject Line</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-medium focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Body Field */}
        <div>
          <label className="text-slate-300 font-semibold block mb-1">Email / Scope Outline Body</label>
          <textarea
            rows="12"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white font-mono text-[12px] leading-relaxed focus:ring-2 focus:ring-indigo-500"
          />
        </div>

      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="text-[11px] text-slate-400">
          Auto-injected: Client Name, Service, Deal Value (₹), Timeline
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenMailto}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Send className="w-4 h-4" />
            <span>Launch Mail Client</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
      />
      {content}
    </div>
  );
}
