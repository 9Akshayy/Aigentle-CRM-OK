import React, { useState } from 'react';
import { crmApi } from '../api/crmApi';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  X,
  FileDown,
  Layers
} from 'lucide-react';

export default function CsvImportExportModal({
  isOpen,
  onClose,
  leads = [],
  onImportSuccess
}) {
  const [activeTab, setActiveTab] = useState('export'); // 'export' or 'import'
  const [importText, setImportText] = useState('');
  const [parsedLeads, setParsedLeads] = useState([]);
  const [importing, setImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  // Handle CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Company Name',
      'Contact Person',
      'Email',
      'Phone',
      'Website',
      'Location',
      'IT Service',
      'Deal Value',
      'Currency',
      'Stage',
      'Priority',
      'Source',
      'Owner',
      'Probability',
      'Next Follow-up',
      'Expected Close',
      'Notes'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = leads.map(l => [
      escapeCsv(l.company_name),
      escapeCsv(l.contact_person),
      escapeCsv(l.email),
      escapeCsv(l.phone),
      escapeCsv(l.website),
      escapeCsv(l.location),
      escapeCsv(l.service),
      l.deal_value || 0,
      escapeCsv(l.currency || 'USD'),
      escapeCsv(l.stage),
      escapeCsv(l.priority),
      escapeCsv(l.source),
      escapeCsv(l.owner),
      l.probability || 0,
      escapeCsv(l.next_followup || ''),
      escapeCsv(l.expected_close || ''),
      escapeCsv(l.notes || '')
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aigentle-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Download Sample CSV Template
  const handleDownloadSample = () => {
    const sampleContent = `Company Name,Contact Person,Email,Phone,Website,Location,IT Service,Deal Value,Currency,Stage,Priority,Source,Owner,Probability,Next Follow-up,Notes
Matrix Robotics,Marcus Thorne,m.thorne@matrixrobotics.com,+1 (555) 777-1234,https://matrixrobotics.com,Boston MA,AI & Machine Learning Solutions,85000,USD,New,High,LinkedIn,Alex Mercer,30,2026-11-25T14:00,Autonomous fleet orchestration system
Skyline Cloudworks,Sarah Lin,s.lin@skylinecloud.io,+1 (555) 888-4321,https://skylinecloud.io,Austin TX,Cloud & DevOps Architecture,62000,USD,Qualified,Urgent,Referral,Elena Rostova,60,2026-11-26T16:00,Kubernetes multi-region migration`;

    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aigentle-sample-leads-template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV File or Text with intelligent header & field detection
  const parseCsvText = (text) => {
    try {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) return [];

      // Find the real header line (contains 'name', 'phone', 'email', or 'contact')
      let headerLineIdx = -1;
      for (let i = 0; i < Math.min(lines.length, 15); i++) {
        const l = lines[i].toLowerCase();
        if ((l.includes('name') || l.includes('contact')) && (l.includes('phone') || l.includes('email') || l.includes('service'))) {
          headerLineIdx = i;
          break;
        }
      }

      if (headerLineIdx === -1) headerLineIdx = 0;

      const rawHeaders = lines[headerLineIdx].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());

      const results = [];
      const seenContacts = new Set();

      for (let i = headerLineIdx + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith(',,,') || line.toLowerCase().includes('total leads:') || line.toLowerCase().includes('leads (date')) continue;

        // CSV splitter handling quotes
        const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
        const matches = [];
        let match;
        while ((match = regex.exec(line)) && matches.length < rawHeaders.length) {
          let val = match[1] || '';
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1).replace(/""/g, '"');
          }
          matches.push(val.trim());
          if (regex.lastIndex === 0) break;
        }

        const obj = {};
        let businessType = '';
        let timeline = '';
        let budgetRaw = '';
        let dateVal = '';

        rawHeaders.forEach((h, idx) => {
          const val = matches[idx] || '';
          if (h.includes('company')) obj.company_name = val;
          else if (h.includes('contact') || h === 'name' || h.includes('person') || h.includes('lead name')) obj.contact_person = val;
          else if (h.includes('email')) obj.email = val;
          else if (h.includes('phone') || h.includes('mobile')) obj.phone = val;
          else if (h.includes('service')) obj.service = val;
          else if (h.includes('budget') || h.includes('deal') || h.includes('value') || h.includes('price')) {
            budgetRaw = val;
            // Clean budget (extract highest number like "₹10,000 – ₹25,000" -> 25000)
            const nums = val.replace(/,/g, '').match(/\d+/g);
            if (nums && nums.length > 0) {
              obj.deal_value = Math.max(...nums.map(n => parseInt(n, 10)));
            } else {
              obj.deal_value = 0;
            }
          }
          else if (h.includes('business') || h.includes('type') || h.includes('industry')) businessType = val;
          else if (h.includes('timeline') || h.includes('start')) timeline = val;
          else if (h.includes('date') || h.includes('time')) dateVal = val;
          else if (h.includes('stage')) obj.stage = val;
          else if (h.includes('priority')) obj.priority = val;
          else if (h.includes('source')) obj.source = val;
          else if (h.includes('owner')) obj.owner = val;
          else if (h.includes('location')) obj.location = val;
          else if (h.includes('website')) obj.website = val;
          else if (h.includes('notes')) obj.notes = val;
        });

        // Skip repeated section headers
        if (!obj.contact_person || obj.contact_person.toLowerCase() === 'name') continue;

        // De-duplicate contacts in same file
        const uniqueKey = (obj.email || obj.phone || obj.contact_person).toLowerCase();
        if (seenContacts.has(uniqueKey)) continue;
        seenContacts.add(uniqueKey);

        // Fallback for company name if not explicitly present
        if (!obj.company_name) {
          obj.company_name = businessType ? `${obj.contact_person} (${businessType})` : `${obj.contact_person} Enterprise`;
        }

        // Set Currency
        obj.currency = budgetRaw.includes('₹') ? 'INR' : (obj.currency || 'INR');

        // Normalize Service
        if (obj.service) {
          const sLower = obj.service.toLowerCase();
          if (sLower.includes('mobile')) obj.service = 'Mobile App Development';
          else if (sLower.includes('web') && sLower.includes('mobile')) obj.service = 'Mobile App Development';
          else if (sLower.includes('web')) obj.service = 'Custom Software Development';
        } else {
          obj.service = 'Mobile App Development';
        }

        // Priority from timeline
        if (!obj.priority) {
          obj.priority = timeline.toLowerCase().includes('immediately') ? 'Urgent' : 'High';
        }

        // Notes compilation
        const extraNotes = [];
        if (timeline) extraNotes.push(`Timeline: ${timeline}`);
        if (businessType) extraNotes.push(`Industry: ${businessType}`);
        if (budgetRaw) extraNotes.push(`Budget: ${budgetRaw}`);
        if (dateVal) extraNotes.push(`Captured: ${dateVal}`);
        if (extraNotes.length > 0) {
          obj.notes = obj.notes ? `${obj.notes} | ${extraNotes.join(' | ')}` : extraNotes.join(' | ');
        }

        obj.stage = obj.stage || 'New';
        obj.source = obj.source || 'Ad Campaign / Form';
        obj.owner = obj.owner || 'Alex Mercer';

        results.push(obj);
      }

      return results;
    } catch (err) {
      console.error('Error parsing CSV:', err);
      return [];
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setImportText(content);
      const parsed = parseCsvText(content);
      setParsedLeads(parsed);
      if (parsed.length === 0) {
        setStatusMessage({ type: 'error', text: 'Could not detect valid leads. Ensure columns include "Company Name" and "Contact Person".' });
      } else {
        setStatusMessage({ type: 'success', text: `Detected ${parsed.length} valid leads ready for import.` });
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (parsedLeads.length === 0) return;

    try {
      setImporting(true);
      const res = await crmApi.importLeads(parsedLeads);
      if (res.success) {
        onImportSuccess();
        alert(`Successfully imported ${res.count} leads into Aigentle CRM!`);
        onClose();
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Import failed.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Import & Export CRM Leads</h2>
              <p className="text-xs text-slate-400">Seamlessly sync CSV spreadsheets with your Aigentle pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 px-6 pt-2 bg-slate-900/30">
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Export Leads ({leads.length})
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV File
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-white text-sm">Export Full Pipeline</h4>
                <p className="text-slate-400 text-xs">
                  Download all {leads.length} leads in CSV format including company profiles, contacts, IT service tags, deal values, stages, priorities, and historical notes.
                </p>
                <div className="pt-3">
                  <button
                    onClick={handleExportCsv}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30"
                  >
                    <Download className="w-4 h-4" />
                    Download CSV File ({leads.length} Leads)
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-500">
                Compatible with Microsoft Excel, Google Sheets, Salesforce, HubSpot, and Notion.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Download template helper */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-300">
                  Need the standard column layout?
                </div>
                <button
                  onClick={handleDownloadSample}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-medium rounded text-xs"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Download Sample CSV
                </button>
              </div>

              {/* Upload input */}
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-900/40 relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-white">Click or drag & drop a CSV file here</p>
                <p className="text-[11px] text-slate-500 mt-1">Supports standard CSV with UTF-8 encoding</p>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-xs ${
                  statusMessage.type === 'error' ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30' :
                  'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {statusMessage.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Parsed Preview Table */}
              {parsedLeads.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">Preview ({parsedLeads.length} leads ready):</span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-lg bg-slate-900/60 divide-y divide-slate-800 text-[11px]">
                    {parsedLeads.slice(0, 5).map((l, i) => (
                      <div key={i} className="p-2 flex items-center justify-between text-slate-300">
                        <span className="font-semibold text-white">{l.company_name}</span>
                        <span>{l.contact_person}</span>
                        <span className="text-indigo-400">{l.service || 'IT Services'}</span>
                        <span className="font-mono">${Number(l.deal_value || 0).toLocaleString()}</span>
                      </div>
                    ))}
                    {parsedLeads.length > 5 && (
                      <div className="p-2 text-center text-slate-500 italic">
                        + {parsedLeads.length - 5} more rows...
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleExecuteImport}
                    disabled={importing}
                    className="w-full mt-3 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30"
                  >
                    {importing ? 'Importing...' : `Import ${parsedLeads.length} Leads to CRM`}
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
