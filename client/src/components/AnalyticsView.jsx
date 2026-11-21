import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Target, 
  DollarSign, 
  Award,
  Layers,
  Briefcase
} from 'lucide-react';
import { FORMAT_CURRENCY, STAGES } from '../constants/crm';

export default function AnalyticsView({ stats, currency }) {
  if (!stats) return null;

  const maxServiceValue = Math.max(...(stats.serviceBreakdown || []).map(s => s.total_value || 0), 1);
  const maxStageValue = Math.max(...(stats.stageBreakdown || []).map(s => s.value || 0), 1);
  const totalLeads = stats.totalLeads || 1;

  return (
    <div className="space-y-6">
      
      {/* Analytics Top Highlight Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-indigo-500/20 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
              Pipeline Intelligence & Revenue Forecasting
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Aigentle Sales Velocity & Conversion Metrics
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time pipeline health, service-line demand distribution, and weighted revenue expectations.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Win Ratio</span>
            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              {stats.winRate}%
            </span>
          </div>
          <div className="w-px h-12 bg-slate-800" />
          <div className="text-right">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Realized Won</span>
            <span className="text-3xl font-extrabold text-emerald-400">
              {FORMAT_CURRENCY(stats.wonRevenue, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Funnel & Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Stage Funnel Analysis */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Pipeline Funnel Stages
              </h3>
              <span className="text-xs text-slate-400">Leads by progression stage</span>
            </div>

            <div className="space-y-3.5">
              {(stats.stageBreakdown || []).map((stageItem) => {
                const stageCfg = STAGES.find(s => s.id === stageItem.stage) || STAGES[0];
                const pct = Math.round(((stageItem.value || 0) / maxStageValue) * 100);

                return (
                  <div key={stageItem.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          stageItem.stage === 'Closed Won' ? 'bg-emerald-400' :
                          stageItem.stage === 'Closed Lost' ? 'bg-rose-400' :
                          stageItem.stage === 'Proposal Sent' ? 'bg-amber-400' : 'bg-indigo-400'
                        }`} />
                        {stageItem.stage}
                        <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-slate-800">
                          {stageItem.count} {stageItem.count === 1 ? 'deal' : 'deals'}
                        </span>
                      </span>

                      <span className="font-bold text-white">
                        {FORMAT_CURRENCY(stageItem.value, currency)}
                      </span>
                    </div>

                    {/* Funnel Progress Bar */}
                    <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          stageItem.stage === 'Closed Won' ? 'bg-emerald-500' :
                          stageItem.stage === 'Closed Lost' ? 'bg-rose-500/70' :
                          stageItem.stage === 'Proposal Sent' ? 'bg-amber-500' :
                          stageItem.stage === 'Negotiation' ? 'bg-purple-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Total Active Pipeline: <strong className="text-white">{FORMAT_CURRENCY(stats.totalPipelineValue, currency)}</strong></span>
            <span>Weighted Forecast: <strong className="text-cyan-400">{FORMAT_CURRENCY(stats.weightedPipelineValue, currency)}</strong></span>
          </div>
        </div>

        {/* 2. Revenue by IT Service Line */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                Pipeline Value by IT Service Offering
              </h3>
              <span className="text-xs text-slate-400">Demand distribution</span>
            </div>

            <div className="space-y-4">
              {(stats.serviceBreakdown || []).map((serviceItem) => {
                const pct = Math.round(((serviceItem.total_value || 0) / maxServiceValue) * 100);

                return (
                  <div key={serviceItem.service} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200 truncate max-w-[240px]">
                        {serviceItem.service}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400">
                          {serviceItem.count} {serviceItem.count === 1 ? 'lead' : 'leads'}
                        </span>
                        <span className="font-bold text-white">
                          {FORMAT_CURRENCY(serviceItem.total_value, currency)}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
            💡 AI Solutions and Cloud Architecture represent the top revenue drivers for Aigentle IT Services.
          </div>
        </div>

      </div>

      {/* Secondary Grid: Lead Sources & Priority Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Lead Sources */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              Lead Acquisition Channels
            </h3>
            <span className="text-xs text-slate-400">By lead volume</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(stats.sourceBreakdown || []).map((src) => {
              const pct = Math.round((src.count / totalLeads) * 100);
              return (
                <div key={src.source} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200 truncate">{src.source}</span>
                    <span className="text-indigo-400 font-bold">{pct}%</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {src.count} <span className="text-xs font-normal text-slate-500">leads</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Value: {FORMAT_CURRENCY(src.total_value, currency)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Matrix */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-400" />
              Deal Priority Distribution
            </h3>
            <span className="text-xs text-slate-400">Urgency classification</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(stats.priorityBreakdown || []).map((p) => {
              let color = 'border-slate-800 text-slate-200';
              if (p.priority === 'Urgent') color = 'border-rose-500/30 text-rose-400 bg-rose-500/10';
              else if (p.priority === 'High') color = 'border-amber-500/30 text-amber-400 bg-amber-500/10';
              else if (p.priority === 'Medium') color = 'border-blue-500/30 text-blue-400 bg-blue-500/10';

              return (
                <div key={p.priority} className={`p-3.5 rounded-xl border ${color}`}>
                  <div className="text-xs font-bold uppercase tracking-wider">{p.priority}</div>
                  <div className="text-2xl font-black text-white mt-1">
                    {p.count}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {Math.round((p.count / totalLeads) * 100)}% of total leads
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
