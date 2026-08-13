import React, { useState } from 'react';
import { 
  PieChart, LayoutDashboard, Briefcase, BarChart2, TrendingUp, Layers, Activity, FileText, CheckCircle, Clock, CheckSquare, Shield, Clock3, Eye
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { SectionHeader, MetricCard, Toolbar, GlobalSummaryItem } from './ui/Base';
import { DataBoundary, LoadingOverlay } from './ui/Feedback';
import { Button } from './ui/Button';

export const PMSWorkspace = React.memo(() => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PORTFOLIO' | 'POSITIONS' | 'HOLDINGS' | 'EXPOSURE' | 'PNL' | 'PERFORMANCE' | 'SNAPSHOTS' | 'AUDIT' | 'INSPECTOR'>('DASHBOARD');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'PORTFOLIO', label: 'Portfolio', icon: Briefcase },
    { id: 'POSITIONS', label: 'Positions', icon: Layers },
    { id: 'HOLDINGS', label: 'Holdings', icon: PieChart },
    { id: 'EXPOSURE', label: 'Exposure', icon: BarChart2 },
    { id: 'PNL', label: 'PnL', icon: TrendingUp },
    { id: 'PERFORMANCE', label: 'Performance', icon: Activity },
    { id: 'SNAPSHOTS', label: 'Snapshots', icon: Clock3 },
    { id: 'AUDIT', label: 'Audit Engine', icon: Shield },
    { id: 'INSPECTOR', label: 'Inspector', icon: Eye },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-terminal-bg text-white font-sans">
      <DataBoundary data={{}} title="Enterprise PMS Workspace">
        <Toolbar>
          <div className="flex items-center gap-2 pr-4 border-r border-terminal-border h-full">
            <PieChart className="w-3.5 h-3.5 text-terminal-amber" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-terminal-muted italic">PMS: ACTIVE</span>
          </div>
          <GlobalSummaryItem label="Total Portfolios" value="4" color="text-terminal-green" />
          <GlobalSummaryItem label="Total Exposure" value="₹14,402,000" color="text-terminal-amber" />
          <GlobalSummaryItem label="Global PnL" value="+₹142,400" color="text-terminal-green" />
        </Toolbar>
        
        <div className="bg-terminal-blue/10 border-b border-terminal-blue/30 px-4 py-1.5 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-2 text-terminal-blue">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold uppercase tracking-wider">PMS MANDATE:</span>
            <span className="text-gray-300">Owns Portfolio, Positions, PnL, Exposure. No live trading.</span>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative pb-12">
          {loading && <LoadingOverlay message="Loading PMS data..." />}
          
          <div className="w-64 border-r border-terminal-border flex flex-col shrink-0 bg-black/20 overflow-hidden">
            <SectionHeader title="PMS Navigation" icon={PieChart} />
            <div className="flex-1 overflow-y-auto py-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 transition-colors relative text-left",
                    activeTab === tab.id ? "bg-terminal-amber/10 text-terminal-amber border-r-2 border-terminal-amber font-bold" : "text-terminal-muted hover:text-white hover:bg-white/5"
                  )}
                >
                  <tab.icon className={cn("w-4 h-4 shrink-0", activeTab === tab.id ? "text-terminal-amber" : "text-terminal-muted")} />
                  <span className="text-[10px] uppercase tracking-wider truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-black/40">
            {activeTab === 'DASHBOARD' && (
               <div className="space-y-4">
                  <SectionHeader title="PMS Dashboard" icon={LayoutDashboard} />
                  <div className="grid grid-cols-4 gap-4">
                     <MetricCard title="Total Portfolios" value="4" />
                     <MetricCard title="Open Positions" value="42" />
                     <MetricCard title="Gross Exposure" value="₹14,402,000" trend="+4%" />
                     <MetricCard title="Unrealized PnL" value="₹142,400" trend="+1.2%" color="text-terminal-green" />
                  </div>
               </div>
            )}
            
            {activeTab === 'PORTFOLIO' && (
               <div className="space-y-4">
                  <SectionHeader title="Enterprise Portfolio Manager" icon={Briefcase} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Portfolio List</span>
                  </div>
               </div>
            )}
            
            {activeTab === 'POSITIONS' && (
               <div className="space-y-4">
                  <SectionHeader title="Enterprise Position Manager" icon={Layers} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Positions List</span>
                  </div>
               </div>
            )}

            {activeTab === 'HOLDINGS' && (
               <div className="space-y-4">
                  <SectionHeader title="Portfolio Holdings Engine" icon={PieChart} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Holdings Details</span>
                  </div>
               </div>
            )}
            
            {activeTab === 'EXPOSURE' && (
               <div className="space-y-4">
                  <SectionHeader title="Enterprise Exposure Engine" icon={BarChart2} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Exposure Metrics</span>
                  </div>
               </div>
            )}

            {activeTab === 'PNL' && (
               <div className="space-y-4">
                  <SectionHeader title="Enterprise PnL Engine" icon={TrendingUp} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">PnL Details</span>
                  </div>
               </div>
            )}

            {activeTab === 'PERFORMANCE' && (
               <div className="space-y-4">
                  <SectionHeader title="Portfolio Performance Engine" icon={Activity} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Performance History</span>
                  </div>
               </div>
            )}

            {activeTab === 'SNAPSHOTS' && (
               <div className="space-y-4">
                  <SectionHeader title="Portfolio Snapshot Engine" icon={Clock3} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Snapshot Records</span>
                  </div>
               </div>
            )}

            {activeTab === 'AUDIT' && (
               <div className="space-y-4">
                  <SectionHeader title="Portfolio Audit Engine" icon={Shield} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Audit Logs</span>
                  </div>
               </div>
            )}

            {activeTab === 'INSPECTOR' && (
               <div className="space-y-4">
                  <SectionHeader title="Portfolio Inspector" icon={Eye} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Inspector View</span>
                  </div>
               </div>
            )}
          </div>
        </div>
      </DataBoundary>
    </div>
  );
});
