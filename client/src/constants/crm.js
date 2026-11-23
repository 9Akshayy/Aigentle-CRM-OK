export const STAGES = [
  { id: 'New', label: 'New Leads', color: 'border-blue-500/40 bg-blue-500/10 text-blue-400', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { id: 'Contacted', label: 'Contacted', color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  { id: 'Qualified', label: 'Qualified', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  { id: 'Proposal Sent', label: 'Proposal Sent', color: 'border-amber-500/40 bg-amber-500/10 text-amber-400', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { id: 'Negotiation', label: 'Negotiation', color: 'border-purple-500/40 bg-purple-500/10 text-purple-400', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { id: 'Closed Won', label: 'Closed Won', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { id: 'Closed Lost', label: 'Closed Lost', color: 'border-rose-500/40 bg-rose-500/10 text-rose-400', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
];

export const SERVICES = [
  'Mobile App Development',
  'Website Development',
  'Web & Mobile App Development',
  'AI & Machine Learning Solutions',
  'Cloud & DevOps Architecture',
  'Custom Software Development',
  'Cybersecurity & Compliance',
  'Managed IT Support & Staffing',
  'Data Engineering & Analytics',
  'IT Strategy & Digital Transformation'
];

export const PRIORITIES = [
  { id: 'Urgent', label: 'Urgent', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30 ring-rose-500/20' },
  { id: 'High', label: 'High', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30 ring-amber-500/20' },
  { id: 'Medium', label: 'Medium', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30 ring-blue-500/20' },
  { id: 'Low', label: 'Low', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30 ring-slate-500/20' },
];

export const SOURCES = [
  'Website',
  'LinkedIn',
  'Meta / Google Ads Lead Form',
  'Referral',
  'Cold Outreach',
  'Tech Event/Webinar',
  'Clutch / Partner',
  'Other'
];

export const OWNERS = [
  'Alex Mercer',
  'Elena Rostova',
  'Rajesh Nair',
  'Sarah Jenkins'
];

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

export const FORMAT_CURRENCY = (amount, currency = 'INR') => {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  if (amount === undefined || amount === null || isNaN(amount)) return `${symbol}0`;
  return `${symbol}${Number(amount).toLocaleString('en-IN')}`;
};

export const GET_WHATSAPP_LINK = (phone, text = '') => {
  if (!phone) return null;
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 10) clean = '91' + clean;
  const msg = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${clean}${msg}`;
};

export const GET_SMS_LINK = (phone, text = '') => {
  if (!phone) return null;
  const clean = phone.replace(/[^0-9+]/g, '');
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent || '');
  const separator = isIOS ? '&' : '?';
  return text ? `sms:${clean}${separator}body=${encodeURIComponent(text)}` : `sms:${clean}`;
};

export const GET_EMAIL_LINK = (email, subject = '', body = '') => {
  if (!email) return null;
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `mailto:${email}${query}`;
};

