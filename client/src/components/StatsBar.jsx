import React from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Award, 
  Percent, 
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { FORMAT_CURRENCY } from '../constants/crm';

export default function StatsBar({ stats, currency }) {
  if (!stats) return null;

  const kpis = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      sub: `${stats.wonCount || 0} Deals Won`,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      title: 'Active Pipeline Value',
      value: FORMAT_CURRENCY(stats.totalPipelineValue, currency),
      sub: `Avg: ${FORMAT_CURRENCY(stats.avgDealSize, currency)}`,
      icon: DollarSign,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20'
    },
    {
      title: 'Weighted Forecast',
      value: FORMAT_CURRENCY(stats.weightedPipelineValue, currency),
      sub: 'Probability Adjusted',
      icon: TrendingUp,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20'
    },
    {
      title: 'Closed Won Revenue',
      value: FORMAT_CURRENCY(stats.wonRevenue, currency),
      sub: 'Realized Contracts',
      icon: Award,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      title: 'Win Rate',
      value: `${stats.winRate}%`,
      sub: 'Of Closed Deals',
      icon: Percent,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    },
    {
      title: 'Overdue Follow-ups',
      value: stats.overdueTasks || 0,
      sub: stats.overdueTasks > 0 ? 'Requires attention!' : 'All clear!',
      icon: AlertCircle,
      color: stats.overdueTasks > 0 ? 'text-rose-400' : 'text-slate-400',
      bg: stats.overdueTasks > 0 ? 'bg-rose-500/10' : 'bg-slate-800/40',
      border: stats.overdueTasks > 0 ? 'border-rose-500/30 ring-1 ring-rose-500/20' : 'border-slate-800'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className={`p-3.5 rounded-xl bg-slate-900/60 border ${kpi.border} backdrop-blur-sm transition-all hover:bg-slate-900/90 hover:scale-[1.01]`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">
                {kpi.title}
              </span>
              <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-white tracking-tight">
              {kpi.value}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {kpi.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}
