import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { crmApi } from '../api/crmApi';
import { FORMAT_CURRENCY, GET_DEFAULT_DIVISION } from '../constants/crm';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  X,
  FileDown,
  Layers,
  FileText,
  Calendar,
  Sparkles,
  ClipboardPaste,
  ArrowRight
} from 'lucide-react';

export default function CsvImportExportModal({
  isOpen,
  onClose,
  leads = [],
  onImportSuccess,
  currency = 'INR'
}) {
  // Default to 'import' tab for immediate ease of use
  const [activeTab, setActiveTab] = useState('import'); // 'import', 'paste', 'export'
  const [importText, setImportText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedLeads, setParsedLeads] = useState([]);
  const [importing, setImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  // Universal parser for both standard CSV/Excel and Date-Wise Meta Ad formats
  const parseUniversalLeadData = (text) => {
    try {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) return [];

      const results = [];
      const seenContacts = new Set();
      
      let currentDate = null;
      let currentHeaders = null;

      for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i].trim();
        if (!rawLine || rawLine.replace(/,/g, '').trim() === '') continue;

        // Check for date section header (e.g., "17-11-2026 | Leads: 7" or "17-11-2026")
        const dateMatch = rawLine.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
        if (dateMatch && (rawLine.includes('|') || rawLine.toLowerCase().includes('lead') || rawLine.split(',')[0].includes(dateMatch[0]))) {
          const [_, d, m, y] = dateMatch;
          currentDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          continue;
        }

        // Check if line is a column header (contains Name, Phone, Email, Service, etc.)
        const lLower = rawLine.toLowerCase();
        if ((lLower.includes('name') || lLower.includes('contact')) && (lLower.includes('phone') || lLower.includes('email') || lLower.includes('service'))) {
          currentHeaders = rawLine.split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
          continue;
        }

        // If we have headers and this looks like a data row
        if (currentHeaders) {
          const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
          const cells = [];
          let match;
          while ((match = regex.exec(rawLine)) && cells.length < currentHeaders.length) {
            let val = match[1] || '';
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.substring(1, val.length - 1).replace(/""/g, '"');
            }
            cells.push(val.trim());
            if (regex.lastIndex === 0) break;
          }

          if (cells.length < 3) continue;

          const obj = {};
          let timeVal = '';
          let businessType = '';
          let startTimeline = '';
          let budgetRaw = '';
          let platform = '';

          currentHeaders.forEach((h, idx) => {
            const val = cells[idx] || '';
            if (h === 'name' || h.includes('contact') || h.includes('person') || h.includes('lead name')) obj.contact_person = val;
            else if (h.includes('company')) obj.company_name = val;
            else if (h.includes('phone') || h.includes('mobile')) obj.phone = val;
            else if (h.includes('email')) obj.email = val;
            else if (h.includes('time') && !h.includes('timeline')) timeVal = val;
            else if (h.includes('service')) obj.service = val;
            else if (h.includes('budget') || h.includes('value') || h.includes('price')) {
              budgetRaw = val;
              const nums = val.replace(/,/g, '').match(/\d+/g);
              if (nums && nums.length > 0) {
                obj.deal_value = Math.max(...nums.map(n => parseInt(n, 10)));
              } else {
                obj.deal_value = 0;
              }
            }
            else if (h.includes('business') || h.includes('type') || h.includes('industry')) businessType = val;
            else if (h.includes('timeline') || h.includes('start')) startTimeline = val;
            else if (h.includes('platform')) platform = val;
            else if (h.includes('stage')) obj.stage = val;
            else if (h.includes('priority')) obj.priority = val;
            else if (h.includes('location')) obj.location = val;
            else if (h.includes('website')) obj.website = val;
            else if (h.includes('notes')) obj.notes = val;
          });

          // Skip repeated section headers
          if (!obj.contact_person || obj.contact_person.toLowerCase() === 'name') continue;

          // De-duplicate in same batch
          const uniqueKey = (obj.email || obj.phone || obj.contact_person).toLowerCase();
          if (seenContacts.has(uniqueKey)) continue;
          seenContacts.add(uniqueKey);

          // Company Name fallback
          if (!obj.company_name) {
            obj.company_name = businessType ? `${obj.contact_person} (${businessType})` : `${obj.contact_person} Enterprise`;
          }

          obj.currency = 'INR';

          // Normalize Service
          if (obj.service) {
            const sLower = obj.service.toLowerCase();
            if (sLower.includes('web') && sLower.includes('mobile')) obj.service = 'Web & Mobile App Development';
            else if (sLower.includes('mobile')) obj.service = 'Mobile App Development';
            else if (sLower.includes('web')) obj.service = 'Website Development';
            else if (sLower.includes('ai') || sLower.includes('machine')) obj.service = 'AI & Machine Learning Solutions';
            else if (sLower.includes('cloud')) obj.service = 'Cloud & DevOps Architecture';
          } else {
            obj.service = 'Mobile App Development';
          }

          // Priority
          if (!obj.priority) {
            obj.priority = (startTimeline.toLowerCase().includes('immediately') || startTimeline.toLowerCase().includes('urgent')) ? 'Urgent' : 'High';
          }

          // Source
          if (platform) {
            obj.source = platform.toLowerCase() === 'ig' ? 'Instagram Ad Campaign' :
                         platform.toLowerCase() === 'fb' ? 'Facebook Ad Campaign' :
                         `Meta Ads (${platform.toUpperCase()})`;
          } else {
            obj.source = 'Meta / Google Ads Lead Form';
          }

          // Division & Verification
          if (!obj.division) {
            obj.division = GET_DEFAULT_DIVISION(obj.service);
          }
          obj.is_verified = obj.is_verified ? 1 : 0;

          // Build created_at timestamp from Date + Time
          if (currentDate) {
            let t = '10:00:00';
            if (timeVal) {
              const parts = timeVal.split(':');
              if (parts.length >= 2) {
                t = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
              }
            }
            obj.created_at = `${currentDate} ${t}`;
          } else {
            obj.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
          }

          // Notes
          const notesParts = [];
          if (startTimeline) notesParts.push(`Timeline: ${startTimeline}`);
          if (businessType) notesParts.push(`Business Type: ${businessType}`);
          if (obj.service) notesParts.push(`Requested: ${obj.service}`);
          if (budgetRaw) notesParts.push(`Budget: ${budgetRaw}`);
          if (platform) notesParts.push(`Platform: ${platform.toUpperCase()}`);
          if (currentDate && timeVal) notesParts.push(`Captured: ${currentDate} ${timeVal}`);
          obj.notes = obj.notes ? `${obj.notes} | ${notesParts.join(' | ')}` : notesParts.join(' | ');

          obj.stage = obj.stage || 'New';
          obj.owner = obj.owner || 'Alex Mercer';
          obj.probability = obj.probability || 20;

          results.push(obj);
        }
      }

      return results;
    } catch (err) {
      console.error('Error parsing lead data:', err);
      return [];
    }
  };

  // Process File (Excel .xlsx / .xls OR .csv)
  const processUploadedFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          const csvText = XLSX.utils.sheet_to_csv(worksheet);
          setImportText(csvText);
          const parsed = parseUniversalLeadData(csvText);
          setParsedLeads(parsed);
          if (parsed.length === 0) {
            setStatusMessage({ type: 'error', text: 'Could not detect leads. Please verify columns contain "Name" and "Phone" or "Email".' });
          } else {
            setStatusMessage({ type: 'success', text: `Successfully parsed ${parsed.length} leads from Excel file "${file.name}".` });
          }
        } catch (err) {
          console.error('Error reading Excel file:', err);
          setStatusMessage({ type: 'error', text: 'Error reading Excel file: ' + err.message });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          setImportText(text);
          const parsed = parseUniversalLeadData(text);
          setParsedLeads(parsed);
          if (parsed.length === 0) {
            setStatusMessage({ type: 'error', text: 'Could not detect leads. Please verify columns contain "Name" and "Phone" or "Email".' });
          } else {
            setStatusMessage({ type: 'success', text: `Successfully parsed ${parsed.length} leads from CSV file "${file.name}".` });
          }
        } catch (err) {
          console.error('Error reading CSV file:', err);
          setStatusMessage({ type: 'error', text: 'Error reading CSV file: ' + err.message });
        }
      };
      reader.readAsText(file);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Direct Text Paste handler
  const handleTextChange = (text) => {
    setImportText(text);
    if (text.trim().length > 10) {
      const parsed = parseUniversalLeadData(text);
      setParsedLeads(parsed);
      if (parsed.length > 0) {
        setStatusMessage({ type: 'success', text: `Detected ${parsed.length} leads from pasted data.` });
      } else {
        setStatusMessage({ type: 'error', text: 'Could not parse leads. Verify headers contain Name and Phone/Email.' });
      }
    } else {
      setParsedLeads([]);
      setStatusMessage(null);
    }
  };

  // Execute Import into CRM
  const handleExecuteImport = async () => {
    if (parsedLeads.length === 0) return;

    try {
      setImporting(true);
      const res = await crmApi.importLeads(parsedLeads);
      if (res.success) {
        onImportSuccess();
        alert(`Success! Processed ${res.count} leads (${res.insertedCount || res.count} new leads added) in Aigentle CRM.`);
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

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      const exportRows = leads.map(l => ({
        'Company Name': l.company_name,
        'Contact Person': l.contact_person,
        'Email': l.email,
        'Phone': l.phone,
        'IT Service': l.service,
        'Division': l.division || 'Mobile App Division',
        'Verified': l.is_verified ? 'Yes' : 'No',
        'Deal Value (INR)': l.deal_value || 0,
        'Currency': l.currency || 'INR',
        'Stage': l.stage,
        'Priority': l.priority,
        'Source': l.source,
        'Captured Date': l.created_at || '',
        'Owner': l.owner,
        'Notes': l.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Aigentle Leads');
      XLSX.writeFile(workbook, `Aigentle_CRM_Leads_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error('Error exporting Excel:', err);
      alert('Error exporting Excel: ' + err.message);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'Company Name', 'Contact Person', 'Email', 'Phone', 'IT Service', 'Division', 'Verified',
      'Deal Value', 'Currency', 'Stage', 'Priority', 'Source', 'Captured Date', 'Owner', 'Notes'
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
      escapeCsv(l.service),
      escapeCsv(l.division || 'Mobile App Division'),
      escapeCsv(l.is_verified ? 'Verified' : 'Unverified'),
      l.deal_value || 0,
      escapeCsv(l.currency || 'INR'),
      escapeCsv(l.stage),
      escapeCsv(l.priority),
      escapeCsv(l.source),
      escapeCsv(l.created_at || ''),
      escapeCsv(l.owner),
      escapeCsv(l.notes || '')
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Aigentle_CRM_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group parsed leads by date for summary display
  const dateSummary = parsedLeads.reduce((acc, l) => {
    const d = l.created_at ? l.created_at.split(' ')[0] : 'Undated';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">Direct Excel (.xlsx) & CSV Lead Import</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Smart Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Directly import Meta ad sheets, date-wise files, and standard spreadsheets
              </p>
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
        <div className="flex border-b border-slate-800 px-4 sm:px-6 pt-2 bg-slate-900/40 gap-1">
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Direct File Upload (.xlsx / .csv)
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            Copy & Paste Sheet
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Export ({leads.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* TAB 1: Direct File Upload (.xlsx, .xls, .csv) */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              
              {/* Drag and Drop Zone */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all relative ${
                  isDragging 
                    ? 'border-cyan-400 bg-cyan-950/20 ring-4 ring-cyan-500/20 scale-[1.01]' 
                    : 'border-slate-700 hover:border-cyan-500/80 bg-slate-900/40 hover:bg-slate-900/70'
                }`}
              >
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      processUploadedFile(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />

                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>

                <p className="text-sm font-bold text-white mb-1">
                  Click to Browse or Drag & Drop Excel or CSV File
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Directly accepts <strong className="text-cyan-300">.xlsx</strong>, <strong className="text-cyan-300">.xls</strong>, and <strong className="text-cyan-300">.csv</strong>. Automatically converts Indian Rupee budgets (`₹`), date sections, and Meta lead fields.
                </p>

                {fileName && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Loaded: {fileName}</span>
                  </div>
                )}
              </div>

              {/* Supported format badges */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-emerald-400">✓</span> Excel (.xlsx, .xls)
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-emerald-400">✓</span> CSV Format
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-emerald-400">✓</span> Date-Wise Meta Ad Format
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-emerald-400">✓</span> Auto-Duplicate Protection
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Direct Text / Copy-Paste */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold block">
                  Paste Raw Excel or CSV Content:
                </label>
                <span className="text-[11px] text-slate-500">
                  Copy from Excel / Google Sheets and paste here
                </span>
              </div>

              <textarea
                rows={6}
                value={importText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Paste your CSV or date-wise leads data here (e.g. 17-11-2026 | Leads: 7 ...)"
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          )}

          {/* TAB 3: Export */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="font-semibold text-white text-sm">Download Pipeline Leads ({leads.length} Records)</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Export all leads with company profiles, contact numbers, email addresses, IT service line, INR deal sizing, pipeline stages, priorities, and campaign capture dates.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Download Excel (.xlsx)
                  </button>

                  <button
                    onClick={handleExportCsv}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                  >
                    <Download className="w-4 h-4" />
                    Download CSV File
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-500">
                Compatible with Microsoft Excel, Google Sheets, Salesforce, HubSpot, and WhatsApp broadcast tools.
              </div>
            </div>
          )}

          {/* Status Alert Banner */}
          {statusMessage && (
            <div className={`p-3 rounded-xl flex items-center gap-2 text-xs ${
              statusMessage.type === 'error' ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30' :
              'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
            }`}>
              {statusMessage.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Parsed Preview Table & Confirmation (Shows in Import & Paste tabs) */}
          {activeTab !== 'export' && parsedLeads.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              
              {/* Date distribution chips */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Preview ({parsedLeads.length} leads detected):</span>
                </span>
                <span className="text-slate-400">
                  Total Value: <strong className="text-cyan-300">{FORMAT_CURRENCY(parsedLeads.reduce((s, l) => s + (l.deal_value || 0), 0), currency)}</strong>
                </span>
              </div>

              {/* Grouped Dates Pill Bar */}
              {Object.keys(dateSummary).length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                  {Object.entries(dateSummary).map(([dStr, cnt]) => (
                    <span key={dStr} className="shrink-0 px-2.5 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1">
                      <span className="text-cyan-400 font-semibold">{dStr}:</span>
                      <strong className="text-white">{cnt} leads</strong>
                    </span>
                  ))}
                </div>
              )}

              {/* Preview Rows */}
              <div className="max-h-52 overflow-y-auto border border-slate-800 rounded-xl bg-slate-900/70 divide-y divide-slate-800 text-[11px]">
                {parsedLeads.slice(0, 8).map((l, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between gap-3 text-slate-300 hover:bg-slate-800/40">
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-white truncate block">{l.company_name}</span>
                      <span className="text-[10px] text-slate-500">{l.contact_person} • {l.phone || l.email}</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                      {l.service}
                    </span>
                    <span className="font-bold text-white shrink-0">
                      {FORMAT_CURRENCY(l.deal_value, currency)}
                    </span>
                  </div>
                ))}
                {parsedLeads.length > 8 && (
                  <div className="p-2 text-center text-slate-500 italic bg-slate-950/40">
                    + {parsedLeads.length - 8} more leads ready to import...
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={handleExecuteImport}
                disabled={importing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-700 hover:opacity-95 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                {importing ? (
                  <span>Importing Leads...</span>
                ) : (
                  <>
                    <span>Confirm & Import {parsedLeads.length} Leads to CRM</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
