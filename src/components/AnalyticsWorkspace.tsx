import React, { useState } from 'react';
import { GlobalResetControlModal } from './common/GlobalResetControlModal';
import { 
  BarChart2, Activity, ShieldCheck, Cpu, Filter, Clock, ArrowUpRight, 
  ArrowDownRight, Zap, BarChart3, Scale, Award, Globe, FileText, 
  History, TrendingUp, PieChart, Layers, Terminal as TerminalIcon, 
  RefreshCcw, Sparkles, CheckCircle2, AlertCircle, TrendingDown, 
  Compass, Target, Sliders, CheckSquare, HelpCircle, PlayCircle, 
  Percent, SlidersHorizontal, Eye, Play, Pause
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { SectionHeader, StatusBadge, MetricCard, Panel, Toolbar, GlobalSummaryItem } from './ui/Base';
import { DataTable } from './ui/Table';
import { LoadingOverlay, EmptyState, DataBoundary } from './ui/Feedback';
import { Button, IconButton } from './ui/Button';
import { ReportingWorkspace } from './ReportingWorkspace';
import { AIAnalyticsWorkspace } from './analytics/AIAnalyticsWorkspace';
import { ResearchAnalyticsWorkspace } from './analytics/ResearchAnalyticsWorkspace';
import { TradingAnalyticsWorkspace } from './analytics/TradingAnalyticsWorkspace';
import { PortfolioAnalyticsWorkspace } from './analytics/PortfolioAnalyticsWorkspace';
import { FinancialAnalyticsWorkspace } from './analytics/FinancialAnalyticsWorkspace';
import { EnterpriseAnalyticsDashboard } from './analytics/EnterpriseAnalyticsDashboard';
import { EnterpriseAnalyticsCommandCenter } from './analytics/EnterpriseAnalyticsCommandCenter';

export const AnalyticsWorkspace = React.memo(({ analytics, trades = [], riskEvents = [], performanceTests = [], performanceBenchmarks = [], performanceReports = [], initialTab }: { analytics: any, trades?: any[], riskEvents?: any[], performanceTests?: any[], performanceBenchmarks?: any[], performanceReports?: any[], initialTab?: 'DASHBOARD' | 'RESEARCH' | 'AI' | 'TRADING' | 'PORTFOLIO' | 'FINANCIAL' | 'REPORTS' | 'INSPECTOR' }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'RESEARCH' | 'AI' | 'TRADING' | 'PORTFOLIO' | 'FINANCIAL' | 'REPORTS' | 'INSPECTOR'>(initialTab || 'DASHBOARD');
  const [loading, setLoading] = useState(false);
  const [analyticsRuntimeStatus, setAnalyticsRuntimeStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');
  const [showResetModal, setShowResetModal] = useState(false);

  const tabs = [
    { id: 'DASHBOARD', label: 'Enterprise Dashboard', icon: BarChart3 },
    { id: 'RESEARCH', label: 'Research Analytics', icon: Compass },
    { id: 'AI', label: 'AI Analytics', icon: Cpu },
    { id: 'TRADING', label: 'Trading Analytics', icon: Activity },
    { id: 'PORTFOLIO', label: 'Portfolio Analytics', icon: PieChart },
    { id: 'FINANCIAL', label: 'Financial Analytics', icon: Scale },
    { id: 'REPORTS', label: 'Enterprise Reports', icon: FileText },
    { id: 'INSPECTOR', label: 'Analytics Inspector', icon: Eye },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-terminal-bg text-white font-sans selection:bg-terminal-amber/30 relative">
      <DataBoundary data={analytics} title="Enterprise Analytics Intelligence Center">
        <Toolbar>
          <div className="flex items-center gap-2 pr-4 border-r border-terminal-border h-full">
            <BarChart3 className="w-3.5 h-3.5 text-terminal-amber" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-terminal-muted italic">Enterprise Analytics: ACTIVE</span>
          </div>
          <GlobalSummaryItem label="Analytics Status" value={analyticsRuntimeStatus === 'ACTIVE' ? "OPERATIONAL (ON)" : "PAUSED (OFF)"} color={analyticsRuntimeStatus === 'ACTIVE' ? "text-terminal-green" : "text-amber-400"} />
          <GlobalSummaryItem label="Data Freshness" value="Real-time (0.1s)" color="text-terminal-blue" />
          <GlobalSummaryItem label="Cross-Workspace" value="6 Connected" color="text-terminal-amber" />
          
          {/* MODULE-LOCAL ANALYTICS CONTROLS: 01 RESET, 02 ON, 03 OFF */}
          <div className="ml-auto flex items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() => setShowResetModal(true)}
              className="px-2.5 py-1 bg-slate-900 border border-amber-500/40 text-amber-300 font-bold text-[10px] rounded flex items-center gap-1 hover:bg-slate-800 transition-all cursor-pointer"
              title="Module-Local Control: Reset Analytics Calculation Cache"
            >
              <RefreshCcw className="w-3 h-3 text-amber-400" />
              <span>01 RESET</span>
            </button>

            <button
              onClick={() => {
                setAnalyticsRuntimeStatus('ACTIVE');
              }}
              disabled={analyticsRuntimeStatus === 'ACTIVE'}
              className={`px-2.5 py-1 text-[10px] font-bold rounded flex items-center gap-1 transition-all cursor-pointer ${
                analyticsRuntimeStatus === 'ACTIVE'
                  ? 'bg-terminal-green text-black font-extrabold'
                  : 'text-emerald-400 hover:bg-emerald-500/20'
              }`}
              title="Module-Local Control: Start Analytics Computation Workers"
            >
              <Play className="w-3 h-3" />
              <span>02 ON</span>
            </button>

            <button
              onClick={() => {
                setAnalyticsRuntimeStatus('PAUSED');
              }}
              disabled={analyticsRuntimeStatus === 'PAUSED'}
              className={`px-2.5 py-1 text-[10px] font-bold rounded flex items-center gap-1 transition-all cursor-pointer ${
                analyticsRuntimeStatus === 'PAUSED'
                  ? 'bg-rose-500 text-black font-extrabold'
                  : 'text-rose-400 hover:bg-rose-500/20'
              }`}
              title="Module-Local Control: Pause Analytics Computation Workers"
            >
              <Pause className="w-3 h-3" />
              <span>03 OFF</span>
            </button>

            <Button variant="ghost" size="xs" onClick={() => setLoading(true)}>
              <RefreshCcw className="w-3 h-3 mr-1" /> Recompute 
            </Button>
          </div>
        </Toolbar>
        
        <div className="bg-terminal-blue/10 border-b border-terminal-blue/30 px-4 py-1.5 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-2 text-terminal-blue">
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold uppercase tracking-wider">ANALYTICS MANDATE:</span>
            <span className="text-gray-300">Analytics is NOT a Business Owner. Analytics ONLY visualizes and reports.</span>
          </div>
        </div>

        <div className="bg-terminal-panel border-b border-terminal-border px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0 font-mono text-xs shadow-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2.5 border-b-2 font-bold uppercase tracking-wider transition-colors whitespace-nowrap flex items-center gap-2",
                activeTab === tab.id ? "border-terminal-amber text-terminal-amber bg-white/5" : "border-transparent text-terminal-muted hover:text-white"
              )}
            >
              <tab.icon className={cn("w-4 h-4 shrink-0", activeTab === tab.id ? "text-terminal-amber" : "text-terminal-muted")} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-black/40 relative">
          {loading && <LoadingOverlay message="Synchronizing cross-workspace analytics..." />}
          
          <div className="max-w-7xl mx-auto space-y-6 pb-16">
            {activeTab === 'DASHBOARD' && (
               <EnterpriseAnalyticsDashboard onNavigateWorkspace={(ws) => setActiveTab(ws as any)} />
            )}
            
            {activeTab === 'RESEARCH' && (
               <ResearchAnalyticsWorkspace />
            )}

            {activeTab === 'AI' && (
               <AIAnalyticsWorkspace />
            )}

            {activeTab === 'TRADING' && (
               <TradingAnalyticsWorkspace />
            )}

            {activeTab === 'PORTFOLIO' && (
               <PortfolioAnalyticsWorkspace />
            )}

            {activeTab === 'FINANCIAL' && (
               <FinancialAnalyticsWorkspace />
            )}

            {activeTab === 'REPORTS' && (
               <ReportingWorkspace />
            )}

            {activeTab === 'INSPECTOR' && (
               <EnterpriseAnalyticsCommandCenter onNavigateWorkspace={(ws) => setActiveTab(ws as any)} />
            )}
          </div>
        </div>
      </DataBoundary>

      <GlobalResetControlModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        moduleTitle="Analytics Intelligence Center"
        moduleKey="ANALYTICS"
        resetApiEndpoint="/api/analytics/reset"
        protectedAssetsNotice="Purges volatile analytics calculation caches and draft test metrics. Published reports, historical performance trades, and audit databases remain protected."
        onSuccess={(data) => {
          alert(`Analytics Calculation Cache Reset executed cleanly. RunID: ${data.resetRunId} (${data.recordsCleared ?? 0} cached metrics cleared).`);
        }}
        onError={(err) => {
          alert(`Analytics Reset Failed: ${err}`);
        }}
      />
    </div>
  );
});
